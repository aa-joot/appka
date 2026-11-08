const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const toDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const computeStreaks = (dateKeys) => {
  if (!dateKeys.length) return { daysLearned: 0, longestStreak: 0, currentStreak: 0 };

  const sorted = [...new Set(dateKeys)].sort();
  const dayMs = 24 * 60 * 60 * 1000;

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00Z`).getTime();
    const curr = new Date(`${sorted[i]}T00:00:00Z`).getTime();
    if (curr - prev === dayMs) {
      currentRun += 1;
      if (currentRun > longestStreak) longestStreak = currentRun;
    } else {
      currentRun = 1;
    }
  }

  let currentStreak = 0;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = new Date(today.getTime() - dayMs).toISOString().slice(0, 10);
  const set = new Set(sorted);

  if (set.has(todayKey) || set.has(yesterdayKey)) {
    let cursor = set.has(todayKey) ? new Date(`${todayKey}T00:00:00Z`) : new Date(`${yesterdayKey}T00:00:00Z`);
    while (set.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor = new Date(cursor.getTime() - dayMs);
    }
  }

  return { daysLearned: sorted.length, longestStreak, currentStreak };
};

// Get stats for word set
router.get('/sets/:setId', authMiddleware, (req, res) => {
  const { setId } = req.params;

  global.db.all(
    'SELECT * FROM learning_history WHERE user_id = ? AND set_id = ?',
    [req.userId, setId],
    (err, histories) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalWords = histories.length;
      const learned = histories.filter(h => h.status === 'learned').length;
      const learning = histories.filter(h => h.status === 'learning').length;
      const newWords = histories.filter(h => h.status === 'new').length;
      
      const totalCorrect = histories.reduce((sum, h) => sum + h.correct, 0);
      const totalIncorrect = histories.reduce((sum, h) => sum + h.incorrect, 0);

      const stats = {
        totalWords,
        learned,
        learning,
        newWords,
        totalCorrect,
        totalIncorrect,
        accuracy: totalCorrect + totalIncorrect > 0 
          ? (totalCorrect / (totalCorrect + totalIncorrect) * 100).toFixed(1)
          : 0
      };

      res.json(stats);
    }
  );
});

// Get overall user stats
router.get('/user', authMiddleware, (req, res) => {
  global.db.all(
    'SELECT * FROM learning_history WHERE user_id = ?',
    [req.userId],
    (err, histories) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const stats = {
        totalWords: histories.length,
        learned: histories.filter(h => h.status === 'learned').length,
        learning: histories.filter(h => h.status === 'learning').length,
        wordsReviewedToday: histories.filter(h => {
          const today = new Date();
          if (!h.last_review) return false;
          const reviewDate = new Date(h.last_review);
          return reviewDate.getDate() === today.getDate() &&
                 reviewDate.getMonth() === today.getMonth() &&
                 reviewDate.getFullYear() === today.getFullYear();
        }).length
      };

      res.json(stats);
    }
  );
});

// Review schedule per set
router.get('/review-schedule', authMiddleware, (req, res) => {
  const now = new Date().toISOString();

  global.db.all(
    `SELECT
       ws.id,
       ws.name,
       ws.language,
       COUNT(lh.id) AS totalWords,
       SUM(CASE WHEN lh.next_review <= ? THEN 1 ELSE 0 END) AS dueNow,
       MIN(CASE WHEN lh.next_review > ? THEN lh.next_review ELSE NULL END) AS nextReviewAt
     FROM word_sets ws
     LEFT JOIN learning_history lh
       ON lh.set_id = ws.id
      AND lh.user_id = ?
     WHERE ws.user_id = ?
     GROUP BY ws.id, ws.name, ws.language
     ORDER BY dueNow DESC, nextReviewAt ASC, ws.name ASC`,
    [now, now, req.userId, req.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const schedule = (rows || []).map((row) => ({
        id: row.id,
        name: row.name,
        language: row.language,
        totalWords: Number(row.totalWords || 0),
        dueNow: Number(row.dueNow || 0),
        nextReviewAt: row.nextReviewAt || null
      }));

      res.json(schedule);
    }
  );
});

// Advanced user stats + heatmap
router.get('/overview', authMiddleware, (req, res) => {
  global.db.all(
    `SELECT 
       status,
       repetitions,
       correct,
       incorrect
     FROM learning_history
     WHERE user_id = ?`,
    [req.userId],
    (historyErr, histories) => {
      if (historyErr) {
        return res.status(500).json({ error: historyErr.message });
      }

      global.db.all(
        `SELECT duration_seconds, created_at
         FROM review_events
         WHERE user_id = ?
         ORDER BY created_at ASC`,
        [req.userId],
        (eventsErr, events) => {
          if (eventsErr) {
            return res.status(500).json({ error: eventsErr.message });
          }

          const totalSeconds = events.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
          const now = new Date();
          const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const lastWeekSeconds = events
            .filter(e => new Date(e.created_at) >= last7Days)
            .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);

          const reviewedWords = histories.filter(h => h.repetitions > 0).length;
          const newWords = histories.filter(h => h.status === 'new').length;
          const learningWords = histories.filter(h => h.status === 'learning').length;
          const learnedWords = histories.filter(h => h.status === 'learned').length;

          const heatMapByDay = {};
          events.forEach((e) => {
            const key = toDateKey(e.created_at);
            if (!key) return;
            if (!heatMapByDay[key]) {
              heatMapByDay[key] = { date: key, reviews: 0, seconds: 0 };
            }
            heatMapByDay[key].reviews += 1;
            heatMapByDay[key].seconds += (e.duration_seconds || 0);
          });

          const heatmap = Object.values(heatMapByDay)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((d) => ({
              date: d.date,
              reviews: d.reviews,
              minutes: Number((d.seconds / 60).toFixed(1))
            }));

          const dateKeys = heatmap.map(d => d.date);
          const { daysLearned, longestStreak, currentStreak } = computeStreaks(dateKeys);

          const dailyAverageMinutes = daysLearned > 0
            ? Number(((totalSeconds / 60) / daysLearned).toFixed(1))
            : 0;

          const totalCorrect = histories.reduce((sum, h) => sum + (h.correct || 0), 0);
          const totalIncorrect = histories.reduce((sum, h) => sum + (h.incorrect || 0), 0);

          res.json({
            totalHours: Number((totalSeconds / 3600).toFixed(2)),
            lastWeekHours: Number((lastWeekSeconds / 3600).toFixed(2)),
            totalReviews: events.length,
            dailyAverageMinutes,
            daysLearned,
            longestStreak,
            currentStreak,
            words: {
              total: histories.length,
              new: newWords,
              learning: learningWords,
              learned: learnedWords,
              reviewed: reviewedWords
            },
            accuracy: totalCorrect + totalIncorrect > 0
              ? Number(((totalCorrect / (totalCorrect + totalIncorrect)) * 100).toFixed(1))
              : 0,
            heatmap
          });
        }
      );
    }
  );
});

module.exports = router;

const express = require('express');
const authMiddleware = require('../middleware/auth');
const { sm2, calculateNextReview } = require('../utils/spaced-repetition');

const router = express.Router();

// Get words to review
router.get('/sets/:setId/review', authMiddleware, (req, res) => {
  const { setId } = req.params;
  const now = new Date().toISOString();
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const reviewLimit = Number.isNaN(requestedLimit) ? 10 : Math.min(Math.max(requestedLimit, 1), 200);

  global.db.all(
    `SELECT lh.id as historyId, w.id as wordId, w.word, w.translation, w.example 
     FROM learning_history lh 
     JOIN words w ON lh.word_id = w.id 
     WHERE lh.user_id = ? AND lh.set_id = ? AND lh.next_review <= ?
     LIMIT ?`,
    [req.userId, setId, now, reviewLimit],
    (err, words) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(words || []);
    }
  );
});

// Get hard words for a set (most often answered incorrectly)
router.get('/sets/:setId/hard-words', authMiddleware, (req, res) => {
  const { setId } = req.params;
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const listLimit = Number.isNaN(requestedLimit) ? 10 : Math.min(Math.max(requestedLimit, 1), 50);

  global.db.all(
    `SELECT
       w.id,
       w.word,
       w.translation,
       lh.correct,
       lh.incorrect,
       (lh.correct + lh.incorrect) AS attempts,
       CASE
         WHEN (lh.correct + lh.incorrect) = 0 THEN 0
         ELSE ROUND((lh.correct * 100.0) / (lh.correct + lh.incorrect), 1)
       END AS accuracy
     FROM learning_history lh
     JOIN words w ON w.id = lh.word_id
     WHERE lh.user_id = ?
       AND lh.set_id = ?
       AND (lh.correct + lh.incorrect) > 0
     ORDER BY lh.incorrect DESC, accuracy ASC, attempts DESC, w.word ASC
     LIMIT ?`,
    [req.userId, setId, listLimit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Submit learning result
router.post('/results', authMiddleware, (req, res) => {
  const { historyId, quality, durationSeconds = 0 } = req.body;

  global.db.get(
    'SELECT * FROM learning_history WHERE id = ? AND user_id = ?',
    [historyId, req.userId],
    (err, history) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!history) {
        return res.status(404).json({ error: 'History not found' });
      }

      const newCorrect = quality >= 3 ? history.correct + 1 : history.correct;
      const newIncorrect = quality < 3 ? history.incorrect + 1 : history.incorrect;

      const newEaseFactor = sm2(history.ease_factor, quality);
      const { nextReviewDate, newInterval } = calculateNextReview(
        history.interval,
        newEaseFactor,
        quality
      );

      const newStatus = history.repetitions >= 2 && newEaseFactor > 2.5 ? 'learned' : 
                       history.repetitions >= 0 ? 'learning' : 'new';

      global.db.run(
        `UPDATE learning_history 
         SET correct = ?, incorrect = ?, ease_factor = ?, interval = ?, 
             next_review = ?, last_review = CURRENT_TIMESTAMP, repetitions = ?, status = ?
         WHERE id = ?`,
        [newCorrect, newIncorrect, newEaseFactor, newInterval, nextReviewDate.toISOString(), 
         history.repetitions + 1, newStatus, historyId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          global.db.run(
            `INSERT INTO review_events (user_id, history_id, quality, duration_seconds)
             VALUES (?, ?, ?, ?)`,
            [req.userId, historyId, quality, Math.max(0, parseInt(durationSeconds, 10) || 0)],
            (eventErr) => {
              if (eventErr) {
                return res.status(500).json({ error: eventErr.message });
              }
              res.json({ success: true, newStatus });
            }
          );
        }
      );
    }
  );
});

module.exports = router;

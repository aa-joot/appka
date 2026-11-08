const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create word set
router.post('/sets', authMiddleware, (req, res) => {
  const { name, description, language } = req.body;
  
  global.db.run(
    'INSERT INTO word_sets (user_id, name, description, language) VALUES (?, ?, ?, ?)',
    [req.userId, name, description, language],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, user_id: req.userId, name, description, language });
    }
  );
});

// Get user's word sets
router.get('/sets', authMiddleware, (req, res) => {
  global.db.all(
    'SELECT * FROM word_sets WHERE user_id = ?',
    [req.userId],
    (err, sets) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(sets);
    }
  );
});

// Import words from text
router.post('/sets/:setId/import', authMiddleware, (req, res) => {
  const { setId } = req.params;
  const { text } = req.body;

  global.db.get(
    'SELECT * FROM word_sets WHERE id = ? AND user_id = ?',
    [setId, req.userId],
    (err, set) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!set) {
        return res.status(404).json({ error: 'Word set not found' });
      }

      const lines = text.split('\n').filter(line => line.trim());
      let imported = 0;

      lines.forEach(line => {
        const [word, translation] = line.split('-').map(s => s.trim());
        if (word && translation) {
          global.db.run(
            'INSERT INTO words (set_id, word, translation) VALUES (?, ?, ?)',
            [setId, word, translation],
            function(err) {
              if (!err) {
                // Create learning history
                global.db.run(
                  'INSERT INTO learning_history (user_id, word_id, set_id) VALUES (?, ?, ?)',
                  [req.userId, this.lastID, setId]
                );
                imported++;
              }
            }
          );
        }
      });

      setTimeout(() => {
        res.status(201).json({ imported, message: `Imported ${imported} words` });
      }, 500);
    }
  );
});

// Get words from set
router.get('/sets/:setId/words', authMiddleware, (req, res) => {
  const { setId } = req.params;

  global.db.all(
    'SELECT w.*, lh.interval, lh.status FROM words w LEFT JOIN learning_history lh ON w.id = lh.word_id AND lh.user_id = ? WHERE w.set_id = ?',
    [req.userId, setId],
    (err, words) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(words);
    }
  );
});

// Delete set with related data
router.delete('/sets/:setId', authMiddleware, (req, res) => {
  const { setId } = req.params;

  global.db.get(
    'SELECT id FROM word_sets WHERE id = ? AND user_id = ?',
    [setId, req.userId],
    (err, set) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!set) {
        return res.status(404).json({ error: 'Word set not found' });
      }

      global.db.serialize(() => {
        global.db.run(
          'DELETE FROM review_events WHERE history_id IN (SELECT id FROM learning_history WHERE set_id = ? AND user_id = ?)',
          [setId, req.userId],
          (deleteReviewEventsErr) => {
            if (deleteReviewEventsErr) {
              return res.status(500).json({ error: deleteReviewEventsErr.message });
            }

            global.db.run(
              'DELETE FROM learning_history WHERE set_id = ? AND user_id = ?',
              [setId, req.userId],
              (deleteHistoryErr) => {
                if (deleteHistoryErr) {
                  return res.status(500).json({ error: deleteHistoryErr.message });
                }

                global.db.run(
                  'DELETE FROM words WHERE set_id = ?',
                  [setId],
                  (deleteWordsErr) => {
                    if (deleteWordsErr) {
                      return res.status(500).json({ error: deleteWordsErr.message });
                    }

                    global.db.run(
                      'DELETE FROM word_sets WHERE id = ? AND user_id = ?',
                      [setId, req.userId],
                      function(deleteSetErr) {
                        if (deleteSetErr) {
                          return res.status(500).json({ error: deleteSetErr.message });
                        }
                        if (this.changes === 0) {
                          return res.status(404).json({ error: 'Word set not found' });
                        }
                        res.json({ message: 'Word set deleted' });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    }
  );
});

module.exports = router;

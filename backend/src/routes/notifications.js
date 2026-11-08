const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const ensurePreferencesRow = (userId, callback) => {
  global.db.run(
    `INSERT INTO notification_preferences (user_id, email_notifications, push_notifications)
     VALUES (?, 0, 0)
     ON CONFLICT(user_id) DO NOTHING`,
    [userId],
    (insertErr) => {
      if (insertErr) return callback(insertErr);

      global.db.get(
        `SELECT email_notifications, push_notifications
         FROM notification_preferences
         WHERE user_id = ?`,
        [userId],
        callback
      );
    }
  );
};

// Get reminder preferences
router.get('/preferences', authMiddleware, (req, res) => {
  ensurePreferencesRow(req.userId, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      emailNotifications: Boolean(row?.email_notifications),
      pushNotifications: Boolean(row?.push_notifications)
    });
  });
});

// Update reminder preferences
router.put('/preferences', authMiddleware, (req, res) => {
  const emailNotifications = Boolean(req.body?.emailNotifications);
  const pushNotifications = Boolean(req.body?.pushNotifications);

  global.db.run(
    `INSERT INTO notification_preferences (user_id, email_notifications, push_notifications)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET
       email_notifications = excluded.email_notifications,
       push_notifications = excluded.push_notifications,
       updated_at = CURRENT_TIMESTAMP`,
    [req.userId, emailNotifications ? 1 : 0, pushNotifications ? 1 : 0],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ emailNotifications, pushNotifications });
    }
  );
});

module.exports = router;

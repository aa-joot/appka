const cron = require('node-cron');
const LearningHistory = require('../models/LearningHistory');
const User = require('../models/User');

// Run every day at 8 AM to check for words to review
const scheduleNotifications = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Running daily notification check...');

      // Find users with words due for review
      const histories = await LearningHistory.find({
        nextReview: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }).populate('userId');

      // Group by user
      const userMap = new Map();
      histories.forEach(h => {
        if (!userMap.has(h.userId._id)) {
          userMap.set(h.userId._id, {
            user: h.userId,
            count: 0
          });
        }
        userMap.get(h.userId._id).count++;
      });

      // Send notifications
      for (const [userId, data] of userMap) {
        if (data.user.notificationPreferences.emailNotifications) {
          // TODO: Send email notification
          console.log(`Would send email to ${data.user.email}: ${data.count} words to review`);
        }

        if (data.user.notificationPreferences.pushNotifications) {
          // TODO: Send push notification
          console.log(`Would send push to user ${userId}: ${data.count} words to review`);
        }
      }
    } catch (error) {
      console.error('Notification scheduling error:', error);
    }
  });
};

module.exports = { scheduleNotifications };

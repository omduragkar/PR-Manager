const Notifications = require("../models/Notification");

const createNotification = async (userId, message) => {
    const timestamp = new Date();

    // Create a new notification
    const notification = new Notifications({
        userId,
        message,
        read: false, // Set initial read status
    });
    await notification.save();
};
module.exports = createNotification;
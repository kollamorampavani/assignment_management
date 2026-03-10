const db = require('../config/db');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating notification' });
    }
};

const { db } = require('../config/firebase');
const { COLLECTION } = require('../config/constants');

class Notification {
    /**
     * Create notification
     * @param {Object} data - Notification data
     */
    static async create(data) {
        try {
            const notificationData = {
                ...data,
                isRead: false,
                createdAt: new Date().toISOString(),
            };

            // Initialize readBy for broadcasts
            if (data.type === 'broadcast') {
                notificationData.readBy = [];
            }

            const docRef = await db.collection('notifications').add(notificationData);
            return { id: docRef.id, ...notificationData };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get notifications for a user (Personal + Broadcasts)
     * @param {string} userId - User ID
     */
    static async getByUser(userId, limit = 20) {
        try {
            // Get personal notifications (Client-side sort to avoid index issues)
            const personalQuery = db.collection('notifications')
                .where('userId', '==', userId)
                .limit(limit);

            // Get broadcasts (Client-side sort to avoid index issues)
            const broadcastQuery = db.collection('notifications')
                .where('type', '==', 'broadcast')
                .limit(limit);

            const [personalSnap, broadcastSnap] = await Promise.all([
                personalQuery.get(),
                broadcastQuery.get()
            ]);

            let notifications = [];

            personalSnap.forEach(doc => {
                const data = doc.data();
                notifications.push({
                    id: doc.id,
                    ...data,
                    isRead: data.isRead || false // Personal uses boolean
                });
            });

            broadcastSnap.forEach(doc => {
                const data = doc.data();
                // Check if userId is in readBy array
                const isRead = data.readBy ? data.readBy.includes(userId) : false;
                notifications.push({ id: doc.id, ...data, isRead });
            });

            // Sort merged results by date desc
            notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return notifications.slice(0, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark as read
     */
    static async markAsRead(id, userId) {
        try {
            const docRef = db.collection('notifications').doc(id);
            const doc = await docRef.get();

            if (!doc.exists) throw new Error('Notifikasi tidak ditemukan');

            const data = doc.data();

            if (data.type === 'broadcast') {
                // Add user to readBy array if not already there
                const readBy = data.readBy || [];
                if (!readBy.includes(userId)) {
                    await docRef.update({
                        readBy: [...readBy, userId]
                    });
                }
            } else {
                // Personal notification
                await docRef.update({ isRead: true });
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Notification;

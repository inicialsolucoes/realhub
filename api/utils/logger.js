const db = require('../db');

/**
 * Logs a user action to the activity_logs table.
 * 
 * @param {number|null} userId - The ID of the user performing the action.
 * @param {string} action - The action performed (e.g., 'LOGIN', 'CREATE', 'UPDATE', 'DELETE').
 * @param {string|null} entityType - The type of entity affected (e.g., 'payment', 'user').
 * @param {number|null} entityId - The ID of the affected entity.
 * @param {object|null} details - Additional JSON details or metadata.
 * @param {string|null} ipAddress - The IP address of the user.
 */
const logAction = async (userId, action, entityType = null, entityId = null, details = null, ipAddress = null) => {
    try {
        const createdAt = new Date();
        await db.query(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress, createdAt]
        );
    } catch (error) {
        console.error('Failed to log action:', error);
        // We don't throw the error to avoid breaking the main request flow
    }
};

module.exports = { logAction };

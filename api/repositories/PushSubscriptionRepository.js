const db = require('../db');

class PushSubscriptionRepository {
    async create(userId, subscriptionJson) {
        let sub;
        try {
            sub = typeof subscriptionJson === 'string' ? JSON.parse(subscriptionJson) : subscriptionJson;
        } catch (e) {
            throw new Error("Invalid subscription JSON");
        }

        const endpoint = sub?.endpoint;
        if (!endpoint) {
            throw new Error("Subscription endpoint is required");
        }
        
        const finalJson = typeof subscriptionJson === 'string' ? subscriptionJson : JSON.stringify(subscriptionJson);

        // Check if endpoint already exists for this user to avoid duplicates
        const [existing] = await db.execute(
            'SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription_json LIKE ?',
            [userId, `%${endpoint}%`]
        );
        
        if (existing.length > 0) {
            await db.execute(
                'UPDATE push_subscriptions SET subscription_json = ? WHERE id = ?',
                [finalJson, existing[0].id]
            );
            return existing[0].id;
        }

        const [result] = await db.execute(
            'INSERT INTO push_subscriptions (user_id, subscription_json) VALUES (?, ?)',
            [userId, finalJson]
        );
        return result.insertId;
    }

    async findByUserId(userId) {
        const [rows] = await db.execute(
            'SELECT subscription_json FROM push_subscriptions WHERE user_id = ?',
            [userId]
        );
        return rows.map(r => JSON.parse(r.subscription_json));
    }

    async findAll() {
        const [rows] = await db.execute('SELECT subscription_json FROM push_subscriptions');
        return rows.map(r => JSON.parse(r.subscription_json));
    }

    async findByUnitId(unitId) {
        const [rows] = await db.execute(
            `SELECT ps.subscription_json 
             FROM push_subscriptions ps
             JOIN users u ON ps.user_id = u.id
             WHERE u.unit_id = ?`,
            [unitId]
        );
        return rows.map(r => JSON.parse(r.subscription_json));
    }

    async deleteByEndpoint(endpoint) {
        // We'd need to parse JSON in SQL which is messy depending on DB version, 
        // or just accept subscription_json as a string match or use a separate endpoint column.
        // For now, let's keep it simple.
        await db.execute('DELETE FROM push_subscriptions WHERE subscription_json LIKE ?', [`%${endpoint}%`]);
    }
}

module.exports = new PushSubscriptionRepository();

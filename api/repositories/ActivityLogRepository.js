const db = require('../db');

class ActivityLogRepository {
    async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const offset = (page - 1) * limit;

        const { user_id, action, entity_type } = options;

        let query = `
            SELECT al.*, u.name as user_name 
            FROM activity_logs al 
            LEFT JOIN users u ON al.user_id = u.id
        `;
        let params = [];
        let conditions = [];

        if (user_id) { conditions.push('al.user_id = ?'); params.push(user_id); }
        if (action) { conditions.push('al.action = ?'); params.push(action); }
        if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type); }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async count(options = {}) {
        const { user_id, action, entity_type } = options;
        let countQuery = 'SELECT COUNT(*) as total FROM activity_logs al';
        let params = [];
        let conditions = [];

        if (user_id) { conditions.push('al.user_id = ?'); params.push(user_id); }
        if (action) { conditions.push('al.action = ?'); params.push(action); }
        if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type); }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            countQuery += where;
        }

        const [totalRows] = await db.query(countQuery, params);
        return totalRows[0].total;
    }

    async findById(id) {
        const [rows] = await db.query(`
            SELECT al.*, u.name as user_name 
            FROM activity_logs al 
            LEFT JOIN users u ON al.user_id = u.id 
            WHERE al.id = ?
        `, [id]);
        return rows[0];
    }
}

module.exports = new ActivityLogRepository();

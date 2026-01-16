const db = require('../db');

class CostCenterRepository {
    async findAll(options = {}, userId, userRole) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const { name, all } = options;

        let query = 'SELECT c.* FROM cost_centers c';
        let params = [];
        let conditions = [];

        if (name) {
            conditions.push('c.name LIKE ?');
            params.push(`%${name}%`);
        }

        if (userRole !== 'admin' && all !== 'true') {
            conditions.push('c.id IN (SELECT cost_center_id FROM user_cost_centers WHERE user_id = ?)');
            params.push(userId);
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async count(options = {}, userId, userRole) {
        const { name, all } = options;
        let countQuery = 'SELECT COUNT(*) as total FROM cost_centers c';
        let params = [];
        let conditions = [];

        if (name) {
            conditions.push('c.name LIKE ?');
            params.push(`%${name}%`);
        }

        if (userRole !== 'admin' && all !== 'true') {
            conditions.push('c.id IN (SELECT cost_center_id FROM user_cost_centers WHERE user_id = ?)');
            params.push(userId);
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            countQuery += where;
        }

        const [totalRows] = await db.query(countQuery, params);
        return totalRows[0].total;
    }

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM cost_centers WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { name, type } = data;
        const costCenterType = type || 'expense';
        const [result] = await db.query('INSERT INTO cost_centers (name, type) VALUES (?, ?)', [name, costCenterType]);
        return result.insertId;
    }

    async update(id, data) {
        const { name, type } = data;
        await db.query('UPDATE cost_centers SET name = ?, type = ? WHERE id = ?', [name, type || 'expense', id]);
    }

    async delete(id) {
        await db.query('DELETE FROM cost_centers WHERE id = ?', [id]);
    }

    async isUsedInPayments(id) {
        const [deps] = await db.query('SELECT id FROM payments WHERE cost_center_id = ? LIMIT 1', [id]);
        return deps.length > 0;
    }

    async isUserLinked(userId, costCenterId) {
        const [rows] = await db.query('SELECT 1 FROM user_cost_centers WHERE user_id = ? AND cost_center_id = ?', [userId, costCenterId]);
        return rows.length > 0;
    }
}

module.exports = new CostCenterRepository();

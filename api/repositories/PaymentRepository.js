const db = require('../db');

class PaymentRepository {
    async findAll(options = {}, userId, userRole, userUnitId) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const { type, date, unit, cost_center_id } = options;

        let query = 'SELECT p.*, u.quadra, u.lote, u.casa, usr.name as code_user_name, c.name as cost_center_name FROM payments p LEFT JOIN units u ON p.unit_id = u.id LEFT JOIN users usr ON p.user_id = usr.id LEFT JOIN cost_centers c ON p.cost_center_id = c.id';
        let params = [];
        let conditions = [];

        // Filters
        if (type) { conditions.push('p.type = ?'); params.push(type); }
        if (date) { conditions.push('p.date = ?'); params.push(date); }
        if (unit) {
            conditions.push('(u.quadra LIKE ? OR u.lote LIKE ? OR u.casa LIKE ?)');
            params.push(`%${unit}%`, `%${unit}%`, `%${unit}%`);
        }
        if (cost_center_id) { conditions.push('p.cost_center_id = ?'); params.push(cost_center_id); }

        // Role Restrictions
        if (userRole !== 'admin') {
            if (userUnitId) {
                conditions.push(`(p.unit_id = ? OR p.user_id = ? OR p.unit_id IS NULL)`);
                params.push(userUnitId, userId);
            } else {
                conditions.push(`(p.user_id = ? OR p.unit_id IS NULL)`);
                params.push(userId);
            }
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        query += ' ORDER BY p.date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async count(options = {}, userId, userRole, userUnitId) {
        const { type, date, unit, cost_center_id } = options;

        let countQuery = 'SELECT COUNT(*) as total FROM payments p LEFT JOIN units u ON p.unit_id = u.id';
        let params = [];
        let conditions = [];

        // Filters
        if (type) { conditions.push('p.type = ?'); params.push(type); }
        if (date) { conditions.push('p.date = ?'); params.push(date); }
        if (unit) {
             conditions.push('(u.quadra LIKE ? OR u.lote LIKE ? OR u.casa LIKE ?)');
             params.push(`%${unit}%`, `%${unit}%`, `%${unit}%`);
        }
        if (cost_center_id) { conditions.push('p.cost_center_id = ?'); params.push(cost_center_id); }

        // Role Restrictions
        if (userRole !== 'admin') {
             if (userUnitId) {
                 conditions.push(`(p.unit_id = ? OR p.user_id = ? OR p.unit_id IS NULL)`);
                 params.push(userUnitId, userId);
             } else {
                 conditions.push(`(p.user_id = ? OR p.unit_id IS NULL)`);
                 params.push(userId);
             }
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            countQuery += where;
        }

        const [totalRows] = await db.query(countQuery, params);
        return totalRows[0].total;
    }

    async findById(id) {
        const [rows] = await db.query(`
            SELECT p.*, u.quadra, u.lote, u.casa, c.name as cost_center_name 
            FROM payments p 
            LEFT JOIN units u ON p.unit_id = u.id 
            LEFT JOIN cost_centers c ON p.cost_center_id = c.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    async create(data) {
        const { date, type, amount, proof, description, unit_id, user_id, cost_center_id } = data;
        const [result] = await db.query(
            'INSERT INTO payments (date, type, amount, proof, description, unit_id, user_id, cost_center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [date, type, amount, proof, description || null, unit_id, user_id, cost_center_id]
        );
        return result.insertId;
    }

    async update(id, data) {
         const { date, finalType, amount, proof, description, finalUnitId, cost_center_id } = data;
         await db.query(
            'UPDATE payments SET date = ?, type = ?, amount = ?, proof = ?, description = ?, unit_id = ?, cost_center_id = ? WHERE id = ?',
            [date, finalType, amount, proof, description || null, finalUnitId, cost_center_id, id]
        );
    }

    async delete(id) {
        await db.query('DELETE FROM payments WHERE id = ?', [id]);
    }

    async updateProofAndType(id, proof, type) {
        await db.query(
            'UPDATE payments SET proof = ?, type = ? WHERE id = ?',
            [proof, type, id]
        );
    }
    
    async getSumByTypeAndMonth(type, month, year) {
         const [result] = await db.query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE type = ? 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
        `, [type, month, year]);
         return result[0].total || 0;
    }

    async getHistory(months = 12) {
        const historyQuery = `
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM payments
            WHERE date >= DATE_SUB(LAST_DAY(NOW()), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month ASC
        `;
        const [history] = await db.query(historyQuery, [months]);
        return history;
    }

    async getLatest(limit = 10) {
        const query = `
            SELECT p.date, p.type, p.amount, c.name as cost_center_name 
            FROM payments p 
            LEFT JOIN cost_centers c ON p.cost_center_id = c.id 
            ORDER BY p.date DESC 
            LIMIT ?
        `;
        const [rows] = await db.query(query, [limit]);
        return rows;
    }
}

module.exports = new PaymentRepository();

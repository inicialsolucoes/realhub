const db = require('../db');

class UserRepository {
    async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const { name, email, phone, unit } = options;

        let query = `
            SELECT u.id, u.name, u.email, u.phone, u.role, u.unit_id, u.created_at,
                   un.quadra, un.lote, un.casa
            FROM users u
            LEFT JOIN units un ON u.unit_id = un.id
        `;

        let params = [];
        let conditions = [];

        if (name) { conditions.push('u.name LIKE ?'); params.push(`%${name}%`); }
        if (email) { conditions.push('u.email LIKE ?'); params.push(`%${email}%`); }
        if (phone) { conditions.push('u.phone LIKE ?'); params.push(`%${phone}%`); }
        if (unit) {
            conditions.push('(un.quadra LIKE ? OR un.lote LIKE ? OR un.casa LIKE ?)');
            params.push(`%${unit}%`, `%${unit}%`, `%${unit}%`);
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
        const queryParams = [...params, limit, offset];

        const [rows] = await db.query(query, queryParams);
        return rows;
    }

    async count(options = {}) {
         const { name, email, phone, unit } = options;
         let countQuery = 'SELECT COUNT(*) as total FROM users u LEFT JOIN units un ON u.unit_id = un.id';
         let params = [];
         let conditions = [];

         if (name) { conditions.push('u.name LIKE ?'); params.push(`%${name}%`); }
         if (email) { conditions.push('u.email LIKE ?'); params.push(`%${email}%`); }
         if (phone) { conditions.push('u.phone LIKE ?'); params.push(`%${phone}%`); }
         if (unit) {
             conditions.push('(un.quadra LIKE ? OR un.lote LIKE ? OR un.casa LIKE ?)');
             params.push(`%${unit}%`, `%${unit}%`, `%${unit}%`);
         }
 
         if (conditions.length > 0) {
             const where = ' WHERE ' + conditions.join(' AND ');
             countQuery += where;
         }

        const [totalRows] = await db.query(countQuery, params);
        return totalRows[0].total;
    }

    async findById(id) {
        const [rows] = await db.execute('SELECT id, name, email, phone, role, unit_id, password, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async create(data) {
        const { name, email, password, phone, role, unit_id } = data;
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, phone, role, unit_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, phone, role, unit_id || null]
        );
        return result.insertId;
    }

    async update(id, data) {
        let query = "UPDATE users SET ";
        let params = [];
        let updates = [];

        if (data.name !== undefined) { updates.push("name = ?"); params.push(data.name); }
        if (data.email !== undefined) { updates.push("email = ?"); params.push(data.email); }
        if (data.phone !== undefined) { updates.push("phone = ?"); params.push(data.phone); }
        if (data.role !== undefined) { updates.push("role = ?"); params.push(data.role); }
        if (data.unit_id !== undefined) { updates.push("unit_id = ?"); params.push(data.unit_id); }
        if (data.password !== undefined) { updates.push("password = ?"); params.push(data.password); }

        if (updates.length > 0) {
            query += updates.join(", ") + " WHERE id = ?";
            params.push(id);
            await db.execute(query, params);
        }
    }

    async delete(id) {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
    }

    async getLinkedCostCenters(userId) {
        const [rows] = await db.execute('SELECT cost_center_id FROM user_cost_centers WHERE user_id = ?', [userId]);
        return rows.map(r => r.cost_center_id);
    }

    async clearLinkedCostCenters(userId) {
        await db.execute('DELETE FROM user_cost_centers WHERE user_id = ?', [userId]);
    }

    async addLinkedCostCenter(userId, costCenterId) {
        await db.execute('INSERT INTO user_cost_centers (user_id, cost_center_id) VALUES (?, ?)', [userId, costCenterId]);
    }

    async countResidents() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM users WHERE unit_id IS NOT NULL');
        return rows[0].total;
    }
}

module.exports = new UserRepository();

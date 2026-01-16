const db = require('../db');

class UnitRepository {
    async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const { quadra, lote, casa, resident_name } = options;

        let params = [];
        let conditions = [];

        if (quadra) { conditions.push('u.quadra = ?'); params.push(quadra); }
        if (lote) { conditions.push('u.lote = ?'); params.push(lote); }
        if (casa) { conditions.push('u.casa = ?'); params.push(casa); }
        
        let join = '';
        if (resident_name) {
            conditions.push('res.name LIKE ?');
            params.push(`%${resident_name}%`);
            join = ' INNER JOIN users res ON res.unit_id = u.id';
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

        const query = `
            SELECT DISTINCT u.*, 
            (SELECT COUNT(*) FROM users WHERE unit_id = u.id) as residents_count 
            FROM units u
            ${join}
            ${where}
            ORDER BY u.quadra, u.lote, u.casa
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, [...params, limit, offset]);
        return rows;
    }

    async count(options = {}) {
        const { quadra, lote, casa, resident_name } = options;
        
        let params = [];
        let conditions = [];

        if (quadra) { conditions.push('u.quadra = ?'); params.push(quadra); }
        if (lote) { conditions.push('u.lote = ?'); params.push(lote); }
        if (casa) { conditions.push('u.casa = ?'); params.push(casa); }
        
        let join = '';
        if (resident_name) {
             conditions.push('res.name LIKE ?');
             params.push(`%${resident_name}%`);
             join = ' INNER JOIN users res ON res.unit_id = u.id';
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM units u ${join} ${where}`;

        const [totalRows] = await db.query(countQuery, params);
        return totalRows[0].total;
    }

    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM units WHERE id = ?', [id]);
        return rows[0];
    }

    async getResidents(unitId) {
        const [residents] = await db.execute('SELECT id, name, email, phone, role FROM users WHERE unit_id = ?', [unitId]);
        return residents;
    }

    async create(data) {
        const { quadra, lote, casa, observacao, interfone } = data;
        const [result] = await db.execute(
            'INSERT INTO units (quadra, lote, casa, observacao, interfone) VALUES (?, ?, ?, ?, ?)',
            [quadra, lote, casa, observacao, interfone]
        );
        return result.insertId;
    }

    async update(id, data) {
         const { quadra, lote, casa, observacao, interfone } = data;
         await db.execute(
            'UPDATE units SET quadra = ?, lote = ?, casa = ?, observacao = ?, interfone = ? WHERE id = ?',
            [quadra, lote, casa, observacao, interfone, id]
        );
    }

    async delete(id) {
        await db.execute('DELETE FROM units WHERE id = ?', [id]);
    }

    async findAllForDropdown() {
        const [rows] = await db.query('SELECT id, quadra, lote, casa FROM units ORDER BY quadra, lote, casa');
        return rows;
    }

    async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM units');
        return rows[0].total;
    }
}

module.exports = new UnitRepository();

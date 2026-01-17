const db = require('../db');

class PostRepository {
    async findAll(options = {}, userId, userRole, userUnitId) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const { category, title } = options;

        let query = 'SELECT p.*, u.quadra, u.lote, u.casa FROM posts p LEFT JOIN units u ON p.unit_id = u.id';
        let params = [];
        let conditions = [];

        // Filters
        if (category) { conditions.push('p.category = ?'); params.push(category); }
        if (title) { conditions.push('p.title LIKE ?'); params.push(`%${title}%`); }

        // Role/Unit Restrictions
        if (userRole !== 'admin') {
            if (userUnitId) {
                // Show public posts OR posts for user's unit
                conditions.push('(p.unit_id IS NULL OR p.unit_id = ?)');
                params.push(userUnitId);
            } else {
                // User has no unit, show only public
                conditions.push('p.unit_id IS NULL');
            }
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async count(options = {}, userId, userRole, userUnitId) {
        const { category, title } = options;

        let query = 'SELECT COUNT(*) as total FROM posts p';
        let params = [];
        let conditions = [];

        if (category) { conditions.push('p.category = ?'); params.push(category); }
        if (title) { conditions.push('p.title LIKE ?'); params.push(`%${title}%`); }

        if (userRole !== 'admin') {
            if (userUnitId) {
                conditions.push('(p.unit_id IS NULL OR p.unit_id = ?)');
                params.push(userUnitId);
            } else {
                conditions.push('p.unit_id IS NULL');
            }
        }

        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            query += where;
        }

        const [rows] = await db.query(query, params);
        return rows[0].total;
    }

    async findById(id) {
        const [rows] = await db.query('SELECT p.*, u.quadra, u.lote, u.casa FROM posts p LEFT JOIN units u ON p.unit_id = u.id WHERE p.id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { category, title, content, file, unit_id } = data;
        const [result] = await db.query(
            'INSERT INTO posts (category, title, content, file, unit_id) VALUES (?, ?, ?, ?, ?)',
            [category, title, content, file || null, unit_id || null]
        );
        return result.insertId;
    }

    async update(id, data) {
        const { category, title, content, file, unit_id } = data;
        await db.query(
            'UPDATE posts SET category = ?, title = ?, content = ?, file = ?, unit_id = ? WHERE id = ?',
            [category, title, content, file || null, unit_id || null, id]
        );
    }

    async delete(id) {
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
    }

    async recordRead(postId, userId) {
        await db.query(
            'INSERT INTO post_reads (post_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_read_at = CURRENT_TIMESTAMP',
            [postId, userId]
        );
    }

    async getReaders(postId) {
        const [rows] = await db.query(
            `SELECT u.name, u.email, pr.last_read_at, u.role, un.quadra, un.lote, un.casa 
             FROM post_reads pr 
             JOIN users u ON pr.user_id = u.id 
             LEFT JOIN units un ON u.unit_id = un.id
             WHERE pr.post_id = ? 
             ORDER BY pr.last_read_at DESC`,
            [postId]
        );
        return rows;
    }
}

module.exports = new PostRepository();

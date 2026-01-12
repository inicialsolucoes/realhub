const db = require('../db');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { user_id, action, entity_type } = req.query;

    let query = `
        SELECT al.*, u.name as user_name 
        FROM activity_logs al 
        LEFT JOIN users u ON al.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs al';
    let params = [];
    let conditions = [];

    if (user_id) { conditions.push('al.user_id = ?'); params.push(user_id); }
    if (action) { conditions.push('al.action = ?'); params.push(action); }
    if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type); }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countParams = params.slice(0, -2);

    try {
        const [totalRows] = await db.query(countQuery, countParams);
        const total = totalRows[0].total;

        const [rows] = await db.query(query, params);

        res.status(200).send({
            data: rows,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT al.*, u.name as user_name 
            FROM activity_logs al 
            LEFT JOIN users u ON al.user_id = u.id 
            WHERE al.id = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(rows[0]);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

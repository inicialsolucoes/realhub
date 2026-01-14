const db = require('../db');
const { logAction } = require('../utils/logger');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { quadra, lote, casa, resident_name } = req.query;

    let params = [];
    let conditions = [];

    if (quadra) { conditions.push('u.quadra = ?'); params.push(quadra); }
    if (lote) { conditions.push('u.lote = ?'); params.push(lote); }
    if (casa) { conditions.push('u.casa = ?'); params.push(casa); }
    if (resident_name) {
        conditions.push('res.name LIKE ?');
        params.push(`%${resident_name}%`);
    }

    const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const join = resident_name ? ' INNER JOIN users res ON res.unit_id = u.id' : '';

    const query = `
        SELECT DISTINCT u.*, 
        (SELECT COUNT(*) FROM users WHERE unit_id = u.id) as residents_count 
        FROM units u
        ${join}
        ${where}
        ORDER BY u.quadra, u.lote, u.casa
        LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM units u ${join} ${where}`;

    try {
        const [totalRows] = await db.query(countQuery, params);
        const total = totalRows[0].total;

        const [rows] = await db.query(query, [...params, limit, offset]);

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
        const [rows] = await db.execute('SELECT * FROM units WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "Unit not found" });

        // Also fetch residents
        const [residents] = await db.execute('SELECT id, name, email, phone, role FROM users WHERE unit_id = ?', [req.params.id]);

        res.status(200).send({ ...rows[0], residents });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    const { quadra, lote, casa, observacao, interfone } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO units (quadra, lote, casa, observacao, interfone) VALUES (?, ?, ?, ?, ?)',
            [quadra, lote, casa, observacao, interfone]
        );

        // LOG CREATE
        const logData = { quadra, lote, casa, observacao, interfone };
        await logAction(req.userId, 'CREATE', 'unit', result.insertId, logData, req.ip);

        res.status(201).send({ message: "Unit created", id: result.insertId });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const { quadra, lote, casa, observacao, interfone } = req.body;
    try {
        // Fetch current state for log
        const [oldRows] = await db.execute('SELECT quadra, lote, casa, observacao, interfone FROM units WHERE id = ?', [req.params.id]);
        const oldData = oldRows[0];

        await db.execute(
            'UPDATE units SET quadra = ?, lote = ?, casa = ?, observacao = ?, interfone = ? WHERE id = ?',
            [quadra, lote, casa, observacao, interfone, req.params.id]
        );

        // LOG UPDATE
        const newData = { quadra, lote, casa, observacao, interfone };
        await logAction(req.userId, 'UPDATE', 'unit', req.params.id, { old: oldData, new: newData }, req.ip);

        res.status(200).send({ message: "Unit updated" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        // Fetch data before deletion for logging
        const [rows] = await db.execute('SELECT quadra, lote, casa, observacao FROM units WHERE id = ?', [req.params.id]);
        const deletedData = rows.length > 0 ? rows[0] : null;

        await db.execute('DELETE FROM units WHERE id = ?', [req.params.id]);

        // LOG DELETE
        await logAction(req.userId, 'DELETE', 'unit', req.params.id, deletedData, req.ip);

        res.status(200).send({ message: "Unit deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

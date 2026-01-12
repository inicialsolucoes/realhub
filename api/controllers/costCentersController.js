const db = require('../db');
const { logAction } = require('../utils/logger');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { name } = req.query;

    let query = 'SELECT c.* FROM cost_centers c';
    let countQuery = 'SELECT COUNT(*) as total FROM cost_centers c';
    let params = [];
    let conditions = [];

    if (name) {
        conditions.push('c.name LIKE ?');
        params.push(`%${name}%`);
    }

    if (req.userRole !== 'admin' && req.query.all !== 'true') {
        conditions.push('c.id IN (SELECT cost_center_id FROM user_cost_centers WHERE user_id = ?)');
        params.push(req.userId);
    }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countParams = params.slice(0, -2); // Remove limit/offset

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
        const [rows] = await db.query('SELECT * FROM cost_centers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "Cost center not found" });
        res.status(200).send(rows[0]);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.create = async (req, res) => {
    const { name, type } = req.body;
    if (!name) return res.status(400).send({ message: "Name is required" });
    const costCenterType = type || 'expense';

    try {
        const [result] = await db.query('INSERT INTO cost_centers (name, type) VALUES (?, ?)', [name, costCenterType]);

        // LOG CREATE
        const logData = { name, type: costCenterType };
        await logAction(req.userId, 'CREATE', 'cost_center', result.insertId, logData, req.ip);

        res.status(201).send({ message: "Cost center created", id: result.insertId });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const { name, type } = req.body;
    if (!name) return res.status(400).send({ message: "Name is required" });

    try {
        // Fetch current state for log
        const [oldRows] = await db.query('SELECT name, type FROM cost_centers WHERE id = ?', [req.params.id]);
        const oldData = oldRows[0];

        await db.query('UPDATE cost_centers SET name = ?, type = ? WHERE id = ?', [name, type || 'expense', req.params.id]);

        // LOG UPDATE
        const newData = { name, type: type || 'expense' };
        await logAction(req.userId, 'UPDATE', 'cost_center', req.params.id, { old: oldData, new: newData }, req.ip);

        res.status(200).send({ message: "Cost center updated" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        // Check dependencies in payments
        const [deps] = await db.query('SELECT id FROM payments WHERE cost_center_id = ? LIMIT 1', [req.params.id]);
        if (deps.length > 0) {
            return res.status(400).send({ message: "Cannot delete cost center in use" });
        }

        // Fetch data before deletion for logging
        const [deletedRows] = await db.query('SELECT name, type FROM cost_centers WHERE id = ?', [req.params.id]);
        const deletedData = deletedRows.length > 0 ? deletedRows[0] : null;

        await db.query('DELETE FROM cost_centers WHERE id = ?', [req.params.id]);

        // LOG DELETE
        await logAction(req.userId, 'DELETE', 'cost_center', req.params.id, deletedData, req.ip);

        res.status(200).send({ message: "Cost center deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

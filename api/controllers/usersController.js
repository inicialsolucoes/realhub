const db = require('../db');
const bcrypt = require('bcrypt');
const { logAction } = require('../utils/logger');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { name, email, phone, unit } = req.query;

    console.log('GET /users params:', req.query);

    let query = `
        SELECT u.id, u.name, u.email, u.phone, u.role, u.unit_id, u.created_at,
               un.quadra, un.lote, un.casa
        FROM users u
        LEFT JOIN units un ON u.unit_id = un.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users u LEFT JOIN units un ON u.unit_id = un.id';

    let params = [];
    let conditions = [];

    if (name) { conditions.push('u.name LIKE ?'); params.push(`%${name}%`); }
    if (email) { conditions.push('u.email LIKE ?'); params.push(`%${email}%`); }
    if (phone) { conditions.push('u.phone LIKE ?'); params.push(`%${phone}%`); }
    if (unit) {
        // Filter by unit string representation check (e.g. searching "Q1 L2")
        // Or simpler: filter by quadra/lote/casa columns if user types partial matches? 
        // Requirement says "Filtro Unidade". Assuming text search on unit details.
        conditions.push('(un.quadra LIKE ? OR un.lote LIKE ? OR un.casa LIKE ?)');
        params.push(`%${unit}%`, `%${unit}%`, `%${unit}%`);
    }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';

    // params for query need limit/offset at the end
    // queryParams will be a copy for the main query
    const queryParams = [...params, limit, offset];

    try {
        const [totalRows] = await db.query(countQuery, params);
        const total = totalRows[0].total;

        const [rows] = await db.query(query, queryParams);
        console.log('Rows found:', rows.length);

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
    // If asking for 'me', return current user
    const id = req.params.id === 'me' ? req.userId : req.params.id;

    // Check permission: Admin or Self
    if (req.userRole !== 'admin' && parseInt(id) !== req.userId) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.execute('SELECT id, name, email, phone, role, unit_id, created_at FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).send({ message: "User not found" });
        const user = rows[0];

        // Fetch linked cost centers
        const [ccRows] = await db.execute('SELECT cost_center_id FROM user_cost_centers WHERE user_id = ?', [id]);
        user.cost_center_ids = ccRows.map(r => r.cost_center_id);

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    const { name, email, password, phone, unit_id, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const userRole = role || 'user';
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, phone, role, unit_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, userRole, unit_id || null]
        );
        const userId = result.insertId;

        // Insert linked cost centers
        if (req.body.cost_center_ids && Array.isArray(req.body.cost_center_ids)) {
            for (const ccId of req.body.cost_center_ids) {
                await db.execute('INSERT INTO user_cost_centers (user_id, cost_center_id) VALUES (?, ?)', [userId, ccId]);
            }
        }

        // LOG CREATE
        const logData = { name, email, phone, role: userRole, unit_id, cost_center_ids: req.body.cost_center_ids };
        await logAction(req.userId, 'CREATE', 'user', userId, logData, req.ip);

        res.status(201).send({ message: 'User created successfully', id: userId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ message: 'Email already in use!' });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id === 'me' ? req.userId : req.params.id;

    if (req.userRole !== 'admin' && parseInt(id) !== req.userId) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    const { name, email, phone } = req.body;
    let query = "UPDATE users SET name = ?, email = ?, phone = ?";
    let params = [name, email, phone];

    if (req.userRole === 'admin') {
        if (req.body.role) { query += ", role = ?"; params.push(req.body.role); }
        if (req.body.unit_id !== undefined) { query += ", unit_id = ?"; params.push(req.body.unit_id); }
    }

    query += " WHERE id = ?";
    params.push(id);

    try {
        // Fetch current state for log
        const [oldRows] = await db.execute('SELECT name, email, phone, role, unit_id FROM users WHERE id = ?', [id]);
        const oldData = oldRows[0];

        await db.execute(query, params);

        if (req.userRole === 'admin' && req.body.cost_center_ids !== undefined && Array.isArray(req.body.cost_center_ids)) {
            await db.execute('DELETE FROM user_cost_centers WHERE user_id = ?', [id]);
            for (const ccId of req.body.cost_center_ids) {
                await db.execute('INSERT INTO user_cost_centers (user_id, cost_center_id) VALUES (?, ?)', [id, ccId]);
            }
        }

        // LOG UPDATE
        const newData = { name, email, phone, role: req.body.role || oldData.role, unit_id: req.body.unit_id !== undefined ? req.body.unit_id : oldData.unit_id, cost_center_ids: req.body.cost_center_ids };
        await logAction(req.userId, 'UPDATE', 'user', id, { old: oldData, new: newData }, req.ip);

        res.status(200).send({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        // Fetch data before deletion for logging
        const [rows] = await db.execute('SELECT name, email, phone, role, unit_id FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "User not found" });
        const deletedData = rows[0];

        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);

        // LOG DELETE
        await logAction(req.userId, 'DELETE', 'user', req.params.id, deletedData, req.ip);

        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

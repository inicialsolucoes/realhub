const db = require('../db');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { quadra, lote, casa } = req.query;

    let query = `
        SELECT u.*, 
        (SELECT COUNT(*) FROM users WHERE unit_id = u.id) as residents_count 
        FROM units u
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM units u';
    let params = [];
    let conditions = [];

    if (quadra) { conditions.push('u.quadra = ?'); params.push(quadra); }
    if (lote) { conditions.push('u.lote = ?'); params.push(lote); }
    if (casa) { conditions.push('u.casa = ?'); params.push(casa); }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    query += ' ORDER BY u.quadra, u.lote, u.casa LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Count params exclude limit/offset
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
    const { quadra, lote, casa, observacao } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO units (quadra, lote, casa, observacao) VALUES (?, ?, ?, ?)',
            [quadra, lote, casa, observacao]
        );
        res.status(201).send({ message: "Unit created", id: result.insertId });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const { quadra, lote, casa, observacao } = req.body;
    try {
        await db.execute(
            'UPDATE units SET quadra = ?, lote = ?, casa = ?, observacao = ? WHERE id = ?',
            [quadra, lote, casa, observacao, req.params.id]
        );
        res.status(200).send({ message: "Unit updated" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.execute('DELETE FROM units WHERE id = ?', [req.params.id]);
        res.status(200).send({ message: "Unit deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

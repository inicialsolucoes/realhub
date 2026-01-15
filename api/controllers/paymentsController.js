const db = require('../db');
const { logAction } = require('../utils/logger');

exports.findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { type, date, unit } = req.query;

    // Base Query
    let query = 'SELECT p.*, u.quadra, u.lote, u.casa, usr.name as code_user_name, c.name as cost_center_name FROM payments p LEFT JOIN units u ON p.unit_id = u.id LEFT JOIN users usr ON p.user_id = usr.id LEFT JOIN cost_centers c ON p.cost_center_id = c.id';
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
    if (req.query.cost_center_id) { conditions.push('p.cost_center_id = ?'); params.push(req.query.cost_center_id); }

    // Role Restrictions
    if (req.userRole !== 'admin') {
        // Morador sees payments linked to their unit OR created by them
        // "Visualizar seus fluxos de caixa, vinculados a sua unidade e sem vinculos, somente"
        // Interpretation: (unit_id matches user.unit_id) OR (user_id matches user.id)
        // Note: If unit_id IS NULL (sem vinculo), maybe they typically shouldn't see it unless they created it.
        // Let's implement: where unit_id = ? OR user_id = ?
        const userUnitId = req.unitId;
        const userId = req.userId;

        // This is complex for standard param array if mixing AND/OR.
        // We add a grouped OR condition to the conditions list.
        if (userUnitId) {
            conditions.push(`(p.unit_id = ${userUnitId} OR p.user_id = ${userId} OR p.unit_id IS NULL)`);
        } else {
            conditions.push(`(p.user_id = ${userId} OR p.unit_id IS NULL)`);
        }
    }

    if (conditions.length > 0) {
        const where = ' WHERE ' + conditions.join(' AND ');
        query += where;
        countQuery += where;
    }

    // Sort by Date Desc
    query += ' ORDER BY p.date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Count params exclude limit/offset
    // Note: Re-using params for countQuery requires care because we pushed limit/offset.
    // However, conditions were built dynamically. The params array has everything.
    // But 'params' has limit/offset at the end. We need to strip them.
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
            SELECT p.*, u.quadra, u.lote, u.casa, c.name as cost_center_name 
            FROM payments p 
            LEFT JOIN units u ON p.unit_id = u.id 
            LEFT JOIN cost_centers c ON p.cost_center_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "Payment not found" });

        const payment = rows[0];

        // Check permissions
        if (req.userRole !== 'admin') {
            const isOwner = payment.user_id === req.userId;
            const isUnitLinked = req.unitId && payment.unit_id === req.unitId;
            const isNoUnit = !payment.unit_id;
            if (!isOwner && !isUnitLinked && !isNoUnit) {
                return res.status(403).send({ message: "Unauthorized" });
            }
        }

        if (payment.unit_id) {
            const [residents] = await db.query('SELECT id, name, email, phone, role FROM users WHERE unit_id = ?', [payment.unit_id]);
            payment.residents = residents;
        }

        res.status(200).send(payment);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    // Morador: forced type=income (entrada)
    let { date, type, amount, proof, description, unit_id, cost_center_id } = req.body;

    // Ensure unit_id is null if empty string or undefined
    if (!unit_id || unit_id === '') {
        unit_id = null;
    }

    if (req.userRole !== 'admin') {
        if (unit_id && parseInt(unit_id) !== req.unitId) {
            return res.status(403).send({ message: "Você só pode vincular lançamentos à sua própria unidade ou deixar sem vínculo." });
        }
    }

    if (!cost_center_id) {
        return res.status(400).send({ message: "Cost center is required" });
    }

    try {
        // Fetch cost center type to ensure consistency
        const [ccRows] = await db.query('SELECT type FROM cost_centers WHERE id = ?', [cost_center_id]);
        if (ccRows.length === 0) return res.status(400).send({ message: "Invalid cost center" });

        // Validate linkage for residents
        if (req.userRole !== 'admin') {
            const [linkRows] = await db.query('SELECT 1 FROM user_cost_centers WHERE user_id = ? AND cost_center_id = ?', [req.userId, cost_center_id]);
            if (linkRows.length === 0) return res.status(403).send({ message: "You are not linked to this cost center" });
        }

        // Admin can override type, otherwise use cost center type
        if (req.userRole === 'admin' && type) {
            // Admin explicitly set the type (including 'pending')
            type = type;
        } else {
            type = ccRows[0].type;
        }

        // Special handling for pending payments without unit (bulk creation)
        if (req.userRole === 'admin' && type === 'pending' && !unit_id) {
            // Fetch all units
            const [units] = await db.query('SELECT id FROM units ORDER BY quadra, lote, casa');

            if (units.length === 0) {
                return res.status(400).send({ message: "No units found to create pending payments" });
            }

            const createdIds = [];

            // Create a pending payment for each unit
            for (const unit of units) {
                const [result] = await db.query(
                    'INSERT INTO payments (date, type, amount, proof, description, unit_id, user_id, cost_center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [date, type, amount, proof, description || null, unit.id, req.userId, cost_center_id]
                );

                createdIds.push(result.insertId);

                // LOG CREATE for each payment
                const logData = { date, type, amount, proof: proof ? '(file)' : null, description, unit_id: unit.id, cost_center_id };
                await logAction(req.userId, 'CREATE', 'payment', result.insertId, logData, req.ip);
            }

            return res.status(201).send({
                message: `${units.length} pending payments created successfully`,
                count: units.length,
                ids: createdIds
            });
        }

        // Normal single payment creation
        const [result] = await db.query(
            'INSERT INTO payments (date, type, amount, proof, description, unit_id, user_id, cost_center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [date, type, amount, proof, description || null, unit_id, req.userId, cost_center_id]
        );

        // LOG CREATE
        const logData = { date, type, amount, proof: proof ? '(file)' : null, description, unit_id, cost_center_id };
        await logAction(req.userId, 'CREATE', 'payment', result.insertId, logData, req.ip);

        res.status(201).send({ message: "Payment created", id: result.insertId });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    // Check permission: Admin or Creator
    // "Conseguir editar o fluxo de caixa somente que ele gerou"

    try {
        // First get the payment to check ownership
        const [rows] = await db.query('SELECT user_id FROM payments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "Payment not found" });
        const payment = rows[0];

        if (req.userRole !== 'admin' && payment.user_id !== req.userId) {
            return res.status(403).send({ message: "You can only edit payments you created" });
        }

        let { date, type, amount, proof, description, unit_id, cost_center_id } = req.body;

        if (!cost_center_id) {
            return res.status(400).send({ message: "Cost center is required" });
        }

        // Fetch cost center type to ensure consistency
        const [ccRows] = await db.query('SELECT type FROM cost_centers WHERE id = ?', [cost_center_id]);
        if (ccRows.length === 0) return res.status(400).send({ message: "Invalid cost center" });

        // Validate linkage for residents
        if (req.userRole !== 'admin') {
            const [linkRows] = await db.query('SELECT 1 FROM user_cost_centers WHERE user_id = ? AND cost_center_id = ?', [req.userId, cost_center_id]);
            if (linkRows.length === 0) return res.status(403).send({ message: "You are not linked to this cost center" });
        }

        // Admin can override type, otherwise use cost center type
        let finalType;
        if (req.userRole === 'admin' && type) {
            finalType = type;
        } else {
            finalType = ccRows[0].type;
        }

        // If admin is changing type to pending, remove the proof
        if (req.userRole === 'admin' && finalType === 'pending') {
            proof = null;
        }

        let finalUnitId = unit_id;
        if (!finalUnitId || finalUnitId === '') finalUnitId = null;

        if (req.userRole !== 'admin') {
            if (finalUnitId && parseInt(finalUnitId) !== req.unitId) {
                return res.status(403).send({ message: "Você só pode vincular lançamentos à sua própria unidade ou deixar sem vínculo." });
            }
        }

        // Fetch current state for log
        const [oldRows] = await db.query('SELECT date, type, amount, proof, description, unit_id, cost_center_id FROM payments WHERE id = ?', [req.params.id]);
        const oldData = oldRows[0];
        if (oldData && oldData.proof) oldData.proof = '(file)';

        await db.query(
            'UPDATE payments SET date = ?, type = ?, amount = ?, proof = ?, description = ?, unit_id = ?, cost_center_id = ? WHERE id = ?',
            [date, finalType, amount, proof, description || null, finalUnitId, cost_center_id, req.params.id]
        );

        // LOG UPDATE
        const newData = { date, type: finalType, amount, proof: proof ? '(file)' : null, description, unit_id: finalUnitId, cost_center_id };
        await logAction(req.userId, 'UPDATE', 'payment', req.params.id, { old: oldData, new: newData }, req.ip);

        res.status(200).send({ message: "Payment updated" });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    // Admin only
    if (req.userRole !== 'admin') {
        return res.status(403).send({ message: "Only admin can delete" });
    }

    try {
        // Fetch data before deletion for logging
        const [rows] = await db.query('SELECT date, type, amount, description, unit_id, cost_center_id FROM payments WHERE id = ?', [req.params.id]);
        const deletedData = rows.length > 0 ? rows[0] : null;

        await db.query('DELETE FROM payments WHERE id = ?', [req.params.id]);

        // LOG DELETE
        await logAction(req.userId, 'DELETE', 'payment', req.params.id, deletedData, req.ip);

        res.status(200).send({ message: "Payment deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.submitProof = async (req, res) => {
    const { proof } = req.body;

    if (!proof) {
        return res.status(400).send({ message: "Proof is required" });
    }

    try {
        // Fetch the payment to check ownership and current state
        const [rows] = await db.query('SELECT type, unit_id, user_id FROM payments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send({ message: "Payment not found" });

        const payment = rows[0];

        // Check if payment is pending
        if (payment.type !== 'pending') {
            return res.status(400).send({ message: "Only pending payments can have proof submitted" });
        }

        // Check permissions: user must be linked to the unit or be admin
        if (req.userRole !== 'admin') {
            if (!payment.unit_id || payment.unit_id !== req.unitId) {
                return res.status(403).send({ message: "You can only submit proof for payments linked to your unit" });
            }
        }

        // Fetch old data for logging
        const [oldRows] = await db.query('SELECT date, type, amount, proof, description, unit_id, cost_center_id FROM payments WHERE id = ?', [req.params.id]);
        const oldData = oldRows[0];
        if (oldData && oldData.proof) oldData.proof = '(file)';

        // Update payment: set proof and change type to 'income'
        await db.query(
            'UPDATE payments SET proof = ?, type = ? WHERE id = ?',
            [proof, 'income', req.params.id]
        );

        // LOG UPDATE
        const newData = { ...oldData, proof: '(file)', type: 'income' };
        await logAction(req.userId, 'UPDATE', 'payment', req.params.id, { old: oldData, new: newData }, req.ip);

        res.status(200).send({ message: "Proof submitted and payment marked as income" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

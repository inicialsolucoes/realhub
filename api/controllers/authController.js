const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/logger');

exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        // Auto-assign role 'morador' (user) for self-registration
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, 'user']
        );

        // LOG REGISTER
        await logAction(result.insertId, 'REGISTER', 'user', result.insertId, { name, email }, req.ip);

        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ message: 'Email already in use!' });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        const user = rows[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: 'Invalid Password!' });
        }

        // Restriction: Resident MUST have a linked unit
        if (user.role === 'user' && !user.unit_id) {
            return res.status(403).send({ message: 'Acesso negado. Sua conta ainda não possui uma unidade vinculada. Entre em contato com a administração.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, unit_id: user.unit_id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: 86400 } // 24 hours
        );

        // LOG LOGIN
        await logAction(user.id, 'LOGIN', 'user', user.id, { email: user.email }, req.ip);

        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            unit_id: user.unit_id,
            accessToken: token
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        const userId = rows.length > 0 ? rows[0].id : null;

        await logAction(userId, 'FORGOT_PASSWORD_REQUEST', 'user', userId, { email }, req.ip);

        // Return 200 even if user not found for security
        res.status(200).send({ message: 'Request received' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    // Note: Since we use JWT, logout is mostly handled client-side by deleting the token.
    // However, we log the intent if the client hits this endpoint.
    try {
        // Authenticated routes pass req.userId
        if (req.userId) {
            await logAction(req.userId, 'LOGOUT', 'user', req.userId, null, req.ip);
        }
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

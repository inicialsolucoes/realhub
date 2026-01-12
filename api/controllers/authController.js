const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

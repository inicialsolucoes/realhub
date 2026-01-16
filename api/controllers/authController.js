const UserService = require('../services/UserService');

exports.register = async (req, res) => {
    try {
        const result = await UserService.register(req.body, req.ip);
        res.status(201).send(result);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ message: 'Email already in use!' });
        }
        if (error.message === 'Missing required fields') {
             return res.status(400).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await UserService.login(req.body.email, req.body.password, req.ip);
        res.status(200).send(result);
    } catch (error) {
        if (error.message === 'User not found.' || error.message === 'Invalid Password!') {
             // Unified error message or split as original? Original was split (404 / 401)
             // Original: 404 for User not found, 401 for Invalid Password
             if (error.message === 'User not found.') return res.status(404).send({ message: error.message });
             return res.status(401).send({ accessToken: null, message: error.message });
        }
        if (error.message.startsWith('Acesso negado')) {
            return res.status(403).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const result = await UserService.forgotPassword(req.body.email, req.ip);
        res.status(200).send(result);
    } catch (error) {
        console.error('ForgotPassword error:', error);
        res.status(500).send({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).send({ message: 'Token e senha são obrigatórios.' });
        }
        const result = await UserService.resetPassword(token, password, req.ip);
        res.status(200).send(result);
    } catch (error) {
        console.error('ResetPassword error:', error);
        if (error.message === 'Token inválido ou expirado.') {
             return res.status(400).send({ message: error.message });
        }
        if (error.message === 'User not found.') { // Should not happen if token valid logic holds, but standard fallback
             return res.status(404).send({ message: 'Usuário não encontrado.' });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.userId) {
            await UserService.logout(req.userId, req.ip);
        }
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

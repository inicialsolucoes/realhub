const UserService = require('../services/UserService');

exports.findAll = async (req, res) => {
    try {
        const result = await UserService.findAll(req.query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    const id = req.params.id === 'me' ? req.userId : req.params.id;

    if (req.userRole !== 'admin' && parseInt(id) !== req.userId) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    try {
        // We handle 'me' logic here by resolving ID? UserService.findById resolves by ID.
        // Yes, ID is resolved.
        const user = await UserService.findById(id);
        if (!user) return res.status(404).send({ message: "User not found" });
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await UserService.createUser(req.body, req.userId, req.ip);
        res.status(201).send({ message: 'User created successfully', id });
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

    try {
        await UserService.updateUser(id, req.body, req.userId, req.userRole, req.ip);
        res.status(200).send({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await UserService.deleteUser(req.params.id, req.userId, req.ip);
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        if (error.message === "User not found") {
             return res.status(404).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

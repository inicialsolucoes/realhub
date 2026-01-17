const PostService = require('../services/PostService');

exports.findAll = async (req, res) => {
    try {
        const result = await PostService.findAll(req.query, req.userId, req.userRole, req.unitId);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const result = await PostService.findById(req.params.id, req.userId, req.userRole, req.unitId);
        if (!result) return res.status(404).send({ message: "Post not found" });
        res.status(200).send(result);
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await PostService.create(req.body, req.userId, req.userRole, req.ip);
        res.status(201).send({ message: "Post created successfully", id });
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await PostService.update(req.params.id, req.body, req.userId, req.userRole, req.ip);
        res.status(200).send({ message: "Post updated successfully" });
    } catch (error) {
        if (error.message === "Post not found") return res.status(404).send({ message: error.message });
        if (error.message === "Unauthorized") return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await PostService.delete(req.params.id, req.userId, req.userRole, req.ip);
        res.status(200).send({ message: "Post deleted successfully" });
    } catch (error) {
        if (error.message === "Post not found") return res.status(404).send({ message: error.message });
        if (error.message === "Unauthorized") return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

const ActivityLogService = require('../services/ActivityLogService');

exports.findAll = async (req, res) => {
    try {
        const result = await ActivityLogService.findAll(req.query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const log = await ActivityLogService.findById(req.params.id);
        if (!log) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(log);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

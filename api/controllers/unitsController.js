const UnitService = require('../services/UnitService');

exports.findAll = async (req, res) => {
    try {
        const result = await UnitService.findAll(req.query);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const unit = await UnitService.findById(req.params.id);
        if (!unit) return res.status(404).send({ message: "Unit not found" });

        res.status(200).send(unit);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await UnitService.create(req.body, req.userId, req.ip);
        res.status(201).send({ message: "Unit created", id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await UnitService.update(req.params.id, req.body, req.userId, req.ip);
        res.status(200).send({ message: "Unit updated" });
    } catch (error) {
         if (error.message === "Unit not found") {
            return res.status(404).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await UnitService.delete(req.params.id, req.userId, req.ip);
        res.status(200).send({ message: "Unit deleted" });
    } catch (error) {
         if (error.message === "Unit not found") {
            return res.status(404).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

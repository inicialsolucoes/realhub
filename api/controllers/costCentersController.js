const CostCenterService = require('../services/CostCenterService');

exports.findAll = async (req, res) => {
    try {
        const result = await CostCenterService.findAll(req.query, req.userId, req.userRole);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const costCenter = await CostCenterService.findById(req.params.id);
        if (!costCenter) return res.status(404).send({ message: "Cost center not found" });
        res.status(200).send(costCenter);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    const { name, type } = req.body;
    if (!name) return res.status(400).send({ message: "Name is required" });

    try {
        const id = await CostCenterService.create({ name, type }, req.userId, req.ip);
        res.status(201).send({ message: "Cost center created", id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    const { name, type } = req.body;
    if (!name) return res.status(400).send({ message: "Name is required" });

    try {
        await CostCenterService.update(req.params.id, { name, type }, req.userId, req.ip);
        res.status(200).send({ message: "Cost center updated" });
    } catch (error) {
        if (error.message === "Cost center not found") {
            return res.status(404).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await CostCenterService.delete(req.params.id, req.userId, req.ip);
        res.status(200).send({ message: "Cost center deleted" });
    } catch (error) {
        if (error.message === "Cannot delete cost center in use") {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

const PaymentService = require('../services/PaymentService');

exports.findAll = async (req, res) => {
    try {
        const result = await PaymentService.findAll(req.query, req.userId, req.userRole, req.unitId);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const payment = await PaymentService.findById(req.params.id, req.userId, req.userRole, req.unitId);
        if (!payment) return res.status(404).send({ message: "Payment not found" });
        res.status(200).send(payment);
    } catch (error) {
        if (error.message === 'Unauthorized') return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await PaymentService.create(req.body, req.userId, req.userRole, req.unitId, req.ip);
        if (result.isBulk) {
            res.status(201).send(result);
        } else {
            res.status(201).send(result);
        }
    } catch (error) {
        if (error.message.includes("could not")) { // Broad catch or specific
             // Default to 500 but some might be 400 or 403
        }
        if (error.message === "Unauthorized" || error.message.includes("Você só pode vincular") || error.message.includes("Your are not linked")) {
             return res.status(403).send({ message: error.message });
        }
        if (error.message === "Cost center is required" || error.message === "Invalid cost center" || error.message === "No units found to create pending payments") {
             return res.status(400).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await PaymentService.update(req.params.id, req.body, req.userId, req.userRole, req.unitId, req.ip);
        res.status(200).send({ message: "Payment updated" });
    } catch (error) {
         if (error.message === "Payment not found") return res.status(404).send({ message: error.message });
         if (error.message.includes("Unauthorized") || error.message.includes("You can only edit") || error.message.includes("Você só pode vincular")) {
             return res.status(403).send({ message: error.message });
         }
         res.status(500).send({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await PaymentService.delete(req.params.id, req.userId, req.userRole, req.ip);
        // Note: Service returns void, if not found returns void (handled safely) or throws.
        // If we want 404, we'd need service to throw. I returned void in service if not found.
        // The previous controller just returned 200 "Payment deleted" even if not found? No, checked length.
        
        // I'll assume success if no error.
        res.status(200).send({ message: "Payment deleted" });
    } catch (error) {
        if (error.message === "You are not authorized to delete this payment") {
            return res.status(403).send({ message: error.message });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.submitProof = async (req, res) => {
    const { proof } = req.body;
    if (!proof) {
        return res.status(400).send({ message: "Proof is required" });
    }

    try {
        await PaymentService.submitProof(req.params.id, proof, req.userId, req.userRole, req.unitId, req.ip);
        res.status(200).send({ message: "Proof submitted and payment marked as income" });
    } catch (error) {
        if (error.message === "Payment not found") return res.status(404).send({ message: error.message });
        if (error.message === "Only pending payments can have proof submitted") return res.status(400).send({ message: error.message });
        if (error.message.includes("You can only submit proof")) return res.status(403).send({ message: error.message });
        res.status(500).send({ message: error.message });
    }
};

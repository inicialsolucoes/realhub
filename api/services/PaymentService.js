const PaymentRepository = require('../repositories/PaymentRepository');
const CostCenterRepository = require('../repositories/CostCenterRepository');
const UnitRepository = require('../repositories/UnitRepository');
const { logAction } = require('../utils/logger');
const NotificationService = require('./NotificationService');

class PaymentService {
    async findAll(options, userId, userRole, userUnitId) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        
        const total = await PaymentRepository.count(options, userId, userRole, userUnitId);
        const rows = await PaymentRepository.findAll(options, userId, userRole, userUnitId);

        return {
            data: rows,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit)
            }
        };
    }

    async findById(id, userId, userRole, userUnitId) {
        const payment = await PaymentRepository.findById(id);
        if (!payment) return null;

        // Check permissions
        if (userRole !== 'admin') {
            const isOwner = payment.user_id === userId;
            const isUnitLinked = userUnitId && payment.unit_id === userUnitId;
            const isNoUnit = !payment.unit_id;
            if (!isOwner && !isUnitLinked && !isNoUnit) {
                throw new Error("Unauthorized");
            }
        }

        if (payment.unit_id) {
            payment.residents = await UnitRepository.getResidents(payment.unit_id);
        }

        return payment;
    }

    async create(data, userId, userRole, userUnitId, ip) {
        let { date, type, amount, proof, description, unit_id, cost_center_id } = data;

        if (!unit_id || unit_id === '') {
            unit_id = null;
        }

        if (userRole !== 'admin') {
            if (unit_id && parseInt(unit_id) !== userUnitId) {
                throw new Error("Você só pode vincular lançamentos à sua própria unidade ou deixar sem vínculo.");
            }
        }

        if (!cost_center_id) {
             throw new Error("Cost center is required");
        }

        const costCenter = await CostCenterRepository.findById(cost_center_id);
        if (!costCenter) throw new Error("Invalid cost center");

        if (userRole !== 'admin') {
             const isLinked = await CostCenterRepository.isUserLinked(userId, cost_center_id);
             if (!isLinked) throw new Error("You are not linked to this cost center");
        }

        if (userRole === 'admin' && type) {
            type = type;
        } else {
            type = costCenter.type;
        }

        // Bulk creation
        if (userRole === 'admin' && type === 'pending' && !unit_id) {
             const units = await UnitRepository.findAllForDropdown();
             if (units.length === 0) {
                 throw new Error("No units found to create pending payments");
             }

             const createdIds = [];
             for (const unit of units) {
                 const id = await PaymentRepository.create({
                     date, type, amount, proof, description, unit_id: unit.id, user_id: userId, cost_center_id
                 });
                 createdIds.push(id);
                 
                 const logData = { date, type, amount, proof: proof ? '(file)' : null, description, unit_id: unit.id, cost_center_id };
                 await logAction(userId, 'CREATE', 'payment', id, logData, ip);

                 // Notify unit residents
                 NotificationService.notifyNewPayment({ id, type, amount, description, unit_id: unit.id }, userId).catch(err => {
                     console.error(`Failed to send payment notifications for unit ${unit.id}:`, err);
                 });
             }

             return {
                 message: `${units.length} pending payments created successfully`,
                 count: units.length,
                 ids: createdIds,
                 isBulk: true
             };
        }

        // Single creation
        const id = await PaymentRepository.create({
            date, type, amount, proof, description, unit_id, user_id: userId, cost_center_id
        });

        const logData = { date, type, amount, proof: proof ? '(file)' : null, description, unit_id, cost_center_id };
        await logAction(userId, 'CREATE', 'payment', id, logData, ip);

        // Notify unit residents
        NotificationService.notifyNewPayment({ id, type, amount, description, unit_id }, userId).catch(err => {
            console.error('Failed to send payment notifications:', err);
        });

        return { message: "Payment created", id };
    }

    async update(id, data, userId, userRole, userUnitId, ip) {
        const payment = await PaymentRepository.findById(id);
        if (!payment) throw new Error("Payment not found");

        if (userRole !== 'admin' && payment.user_id !== userId) {
            throw new Error("You can only edit payments you created");
        }

        let { date, type, amount, proof, description, unit_id, cost_center_id } = data;

        if (!cost_center_id) throw new Error("Cost center is required");

        const costCenter = await CostCenterRepository.findById(cost_center_id);
        if (!costCenter) throw new Error("Invalid cost center");

        if (userRole !== 'admin') {
             const isLinked = await CostCenterRepository.isUserLinked(userId, cost_center_id);
             if (!isLinked) throw new Error("You are not linked to this cost center");
        }

        let finalType;
        if (userRole === 'admin' && type) {
            finalType = type;
        } else {
            finalType = costCenter.type;
        }

        if (userRole === 'admin' && finalType === 'pending') {
            proof = null;
        }

        let finalUnitId = unit_id;
        if (!finalUnitId || finalUnitId === '') finalUnitId = null;

        if (userRole !== 'admin') {
             if (finalUnitId && parseInt(finalUnitId) !== userUnitId) {
                 throw new Error("Você só pode vincular lançamentos à sua própria unidade ou deixar sem vínculo.");
             }
        }

        // Old Data Log
        const oldData = { ...payment };
        if (oldData.proof) oldData.proof = '(file)';

        await PaymentRepository.update(id, {
            date, finalType, amount, proof, description, finalUnitId, cost_center_id
        });

        const newData = { date, type: finalType, amount, proof: proof ? '(file)' : null, description, unit_id: finalUnitId, cost_center_id };
        await logAction(userId, 'UPDATE', 'payment', id, { old: oldData, new: newData }, ip);
    }

    async delete(id, userId, userRole, ip) {
        const payment = await PaymentRepository.findById(id);
        if (!payment) {
             return; 
        }
        
        if (userRole !== 'admin' && userId !== payment.user_id) {
            throw new Error("You are not authorized to delete this payment");
        }

        await PaymentRepository.delete(id);
        await logAction(userId, 'DELETE', 'payment', id, payment, ip);
    }

    async submitProof(id, proof, userId, userRole, userUnitId, ip) {
        const payment = await PaymentRepository.findById(id);
        if (!payment) throw new Error("Payment not found");

        if (payment.type !== 'pending') {
            throw new Error("Only pending payments can have proof submitted");
        }

        if (userRole !== 'admin') {
            if (!payment.unit_id || payment.unit_id !== userUnitId) {
                throw new Error("You can only submit proof for payments linked to your unit");
            }
        }

        const oldData = { ...payment };
        if (oldData.proof) oldData.proof = '(file)';

        await PaymentRepository.updateProofAndType(id, proof, 'income');

        const newData = { ...oldData, proof: '(file)', type: 'income' };
        await logAction(userId, 'UPDATE', 'payment', id, { old: oldData, new: newData }, ip);
    }
}

module.exports = new PaymentService();

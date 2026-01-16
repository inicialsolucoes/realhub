const CostCenterRepository = require('../repositories/CostCenterRepository');
const { logAction } = require('../utils/logger');

class CostCenterService {
    async findAll(options, userId, userRole) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        
        const total = await CostCenterRepository.count(options, userId, userRole);
        const rows = await CostCenterRepository.findAll(options, userId, userRole);
        
        return {
            data: rows,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit)
            }
        };
    }

    async findById(id) {
        return await CostCenterRepository.findById(id);
    }

    async create(data, requesterId, ip) {
        const id = await CostCenterRepository.create(data);
        const logData = { name: data.name, type: data.type || 'expense' };
        await logAction(requesterId, 'CREATE', 'cost_center', id, logData, ip);
        return id;
    }

    async update(id, data, requesterId, ip) {
        const oldData = await CostCenterRepository.findById(id);
        if (!oldData) throw new Error("Cost center not found");

        await CostCenterRepository.update(id, data);

        const newData = { name: data.name, type: data.type || 'expense' };
        await logAction(requesterId, 'UPDATE', 'cost_center', id, { old: oldData, new: newData }, ip);
    }

    async delete(id, requesterId, ip) {
        const isUsed = await CostCenterRepository.isUsedInPayments(id);
        if (isUsed) {
            throw new Error("Cannot delete cost center in use");
        }

        const deletedData = await CostCenterRepository.findById(id);
        
        await CostCenterRepository.delete(id);
        
        if (deletedData) {
            await logAction(requesterId, 'DELETE', 'cost_center', id, deletedData, ip);
        }
    }
}

module.exports = new CostCenterService();

const UnitRepository = require('../repositories/UnitRepository');
const { logAction } = require('../utils/logger');

class UnitService {
    async findAll(options) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        
        const total = await UnitRepository.count(options);
        const rows = await UnitRepository.findAll(options);
        
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
        const unit = await UnitRepository.findById(id);
        if (unit) {
            unit.residents = await UnitRepository.getResidents(id);
        }
        return unit;
    }

    async create(data, requesterId, ip) {
        const id = await UnitRepository.create(data);
        const logData = { quadra: data.quadra, lote: data.lote, casa: data.casa, observacao: data.observacao, interfone: data.interfone };
        await logAction(requesterId, 'CREATE', 'unit', id, logData, ip);
        return id;
    }

    async update(id, data, requesterId, ip) {
        const oldData = await UnitRepository.findById(id);
        if (!oldData) throw new Error("Unit not found");

        await UnitRepository.update(id, data);
        
        const newData = { quadra: data.quadra, lote: data.lote, casa: data.casa, observacao: data.observacao, interfone: data.interfone };
        await logAction(requesterId, 'UPDATE', 'unit', id, { old: oldData, new: newData }, ip);
    }

    async delete(id, requesterId, ip) {
        const deletedData = await UnitRepository.findById(id);
        if (!deletedData) throw new Error("Unit not found");

        await UnitRepository.delete(id);
        await logAction(requesterId, 'DELETE', 'unit', id, deletedData, ip);
    }
}

module.exports = new UnitService();

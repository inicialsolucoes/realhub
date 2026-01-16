const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class ActivityLogService {
    async findAll(options) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;

        const total = await ActivityLogRepository.count(options);
        const rows = await ActivityLogRepository.findAll(options);

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
        return await ActivityLogRepository.findById(id);
    }
}

module.exports = new ActivityLogService();

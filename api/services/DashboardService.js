const UnitRepository = require('../repositories/UnitRepository');
const UserRepository = require('../repositories/UserRepository');
const PaymentRepository = require('../repositories/PaymentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class DashboardService {
    async getStats() {
        const units = await UnitRepository.countAll();
        const residents = await UserRepository.countResidents();

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const income = await PaymentRepository.getSumByTypeAndMonth('income', currentMonth, currentYear);
        const expense = await PaymentRepository.getSumByTypeAndMonth('expense', currentMonth, currentYear);

        const history = await PaymentRepository.getHistory();

        return {
            units,
            residents,
            income,
            expense,
            history
        };
    }

    async getActivities() {
        // Fetch 10 recent activities.
        const rows = await ActivityLogRepository.findAll({ limit: 10, page: 1 });
        return rows;
    }

    async getLatestPayments() {
        return await PaymentRepository.getLatest(10);
    }
}

module.exports = new DashboardService();

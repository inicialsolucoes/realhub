const DashboardService = require('../services/DashboardService');

exports.getStats = async (req, res) => {
    try {
        const stats = await DashboardService.getStats();
        res.status(200).send(stats);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const activities = await DashboardService.getActivities();
        res.status(200).send(activities);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLatestPayments = async (req, res) => {
    try {
        const payments = await DashboardService.getLatestPayments();
        res.status(200).send(payments);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

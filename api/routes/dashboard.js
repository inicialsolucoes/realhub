const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/stats', verifyToken, controller.getStats);
router.get('/activity-logs', verifyToken, controller.getActivities);
router.get('/latest-payments', verifyToken, controller.getLatestPayments);

module.exports = router;

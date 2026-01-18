const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/auth');

router.get('/revenue', [verifyToken], controller.getRevenueReport);
router.get('/expenses', [verifyToken], controller.getExpensesReport);

module.exports = router;

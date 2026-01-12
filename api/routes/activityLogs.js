const express = require('express');
const router = express.Router();
const controller = require('../controllers/activityLogsController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, controller.findAll);
router.get('/:id', verifyToken, isAdmin, controller.findOne);

module.exports = router;

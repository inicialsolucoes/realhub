const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', [verifyToken, isAdmin], controller.findAll);
router.post('/', [verifyToken, isAdmin], controller.create);
router.get('/:id', [verifyToken], controller.findOne); // Handles 'me'
router.put('/:id', [verifyToken], controller.update); // Handles 'me', checks permissions inside
router.delete('/:id', [verifyToken, isAdmin], controller.delete);

module.exports = router;

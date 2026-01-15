const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentsController');
const { verifyToken } = require('../middleware/auth');

router.get('/', [verifyToken], controller.findAll);
router.get('/:id', [verifyToken], controller.findOne);
router.post('/', [verifyToken], controller.create);
router.put('/:id', [verifyToken], controller.update);
router.post('/:id/submit-proof', [verifyToken], controller.submitProof);
router.delete('/:id', [verifyToken], controller.delete); // Controller checks admin internally too, but we can rely on that

module.exports = router;

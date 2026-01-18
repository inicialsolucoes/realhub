const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const PushSubscriptionRepository = require('../repositories/PushSubscriptionRepository');

router.post('/subscribe', verifyToken, async (req, res) => {
    try {
        const subscription = req.body;
        const userId = req.userId;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: 'Assinatura inválida' });
        }

        await PushSubscriptionRepository.create(userId, JSON.stringify(subscription));
        res.status(201).json({ message: 'Inscrito com sucesso para notificações push' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Erro ao salvar inscrição de notificação' });
    }
});

module.exports = router;

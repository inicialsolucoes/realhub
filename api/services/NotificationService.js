const webpush = require('web-push');
const mailer = require('../utils/mailer');
const db = require('../db');
const PushSubscriptionRepository = require('../repositories/PushSubscriptionRepository');

// Configure web-push with VAPID keys from .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@realhub.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

class NotificationService {
    async notify({ title, body, unitId = null, excludeUserId = null, data = {} }) {
        try {
            console.log(`Starting notification process: ${title}`);
            
            // 1. Fetch relevant users for Email
            let userQuery = 'SELECT id, email, name FROM users WHERE 1=1';
            const userParams = [];

            if (unitId) {
                userQuery += ' AND unit_id = ?';
                userParams.push(unitId);
            }

            if (excludeUserId) {
                userQuery += ' AND id != ?';
                userParams.push(excludeUserId);
            }

            const [recipients] = await db.execute(userQuery, userParams);
            console.log(`Found ${recipients.length} email recipients.`);

            // 2. Send Emails (Async, don't block)
            recipients.forEach(user => {
                if (user.email) {
                    mailer.sendNotificationEmail(user.email, title, body).catch(err => {
                        console.error(`Error sending email to ${user.email}:`, err);
                    });
                }
            });

            // 3. Fetch relevant Push Subscriptions
            let subscriptions = [];
            if (unitId) {
                subscriptions = await PushSubscriptionRepository.findByUnitId(unitId);
            } else {
                subscriptions = await PushSubscriptionRepository.findAll();
            }
            
            console.log(`Found ${subscriptions.length} push subscriptions.`);

            // 4. Send Push Notifications (Async)
            const payload = JSON.stringify({
                notification: {
                    title,
                    body,
                    data: {
                        ...data,
                        url: data.url || '/dashboard'
                    }
                }
            });

            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification(sub, payload);
                    console.log('Push notification sent successfully to endpoint:', sub.endpoint);
                } catch (err) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        console.log('Push subscription expired, removing...');
                        await PushSubscriptionRepository.deleteByEndpoint(sub.endpoint);
                    } else {
                        console.error('Push notification error for endpoint:', sub.endpoint, err);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('NotificationService Error:', error);
            return false;
        }
    }

    async notifyNewPost(post, creatorId) {
        const title = 'Nova Publicação';
        const body = post.title;
        const unitId = post.unit_id; // If null, it's for everyone

        return this.notify({
            title,
            body,
            unitId,
            excludeUserId: creatorId,
            data: { url: `/posts/${post.id}` }
        });
    }

    async notifyNewPayment(payment, creatorId) {
        const title = 'Novo Pagamento Registrado';
        const typeLabel = payment.type === 'income' ? 'Receita' : 'Despesa';
        const body = `${typeLabel}: ${payment.description} - R$ ${payment.amount}`;
        const unitId = payment.unit_id;

        return this.notify({
            title,
            body,
            unitId,
            excludeUserId: creatorId,
            data: { url: `/payments/${payment.id}` }
        });
    }
}

module.exports = new NotificationService();

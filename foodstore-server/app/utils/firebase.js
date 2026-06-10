const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');
const isConfigured = fs.existsSync(serviceAccountPath);

if (isConfigured && !getApps().length) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
}

async function sendOrderStatusNotification({ fcm_token, order_number, status }) {
    if (!isConfigured || !fcm_token) return;

    const statusLabel = {
        processing:  'Pesanan Sedang Diproses',
        in_delivery: 'Pesanan Dalam Pengiriman',
        delivered:   'Pesanan Telah Diterima',
    };

    try {
        const response = await getMessaging().send({
            token: fcm_token,
            notification: {
                title: `Order #${order_number}`,
                body: statusLabel[status] || status,
            },
            data: {
                order_number: String(order_number),
                status,
                type: 'order_status',
            },
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default', badge: 1 } } },
        });
        console.log(`[FCM] ✓ sent order #${order_number} (${status}) → ${response}`);
    } catch (err) {
        console.error(`[FCM] ✗ failed order #${order_number}:`, err.message);
    }
}

module.exports = { sendOrderStatusNotification };

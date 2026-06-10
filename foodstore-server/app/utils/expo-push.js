const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const statusLabel = {
    processing:  'Pesanan Sedang Diproses',
    in_delivery: 'Pesanan Dalam Pengiriman',
    delivered:   'Pesanan Telah Diterima',
};

async function sendOrderStatusNotification({ fcm_token, order_number, status }) {
    if (!fcm_token || !Expo.isExpoPushToken(fcm_token)) {
        console.warn(`[PUSH] skip — bukan Expo token: ${fcm_token}`);
        return;
    }

    const message = {
        to: fcm_token,
        sound: 'default',
        title: `Order #${order_number}`,
        body: statusLabel[status] || status,
        data: { order_number: String(order_number), status, type: 'order_status' },
    };

    try {
        const [ticket] = await expo.sendPushNotificationsAsync([message]);
        if (ticket.status === 'error') {
            console.error(`[PUSH] ✗ failed order #${order_number}:`, ticket.message);
        } else {
            console.log(`[PUSH] ✓ sent order #${order_number} (${status}) → ${ticket.id}`);
        }
    } catch (err) {
        console.error(`[PUSH] ✗ failed order #${order_number}:`, err.message);
    }
}

module.exports = { sendOrderStatusNotification };

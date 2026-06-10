const axios = require('axios');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const statusLabel = {
    processing:  'Pesanan Sedang Diproses',
    in_delivery: 'Pesanan Dalam Pengiriman',
    delivered:   'Pesanan Telah Diterima',
};

function isExpoPushToken(token) {
    return typeof token === 'string' && /^ExponentPushToken\[.+\]$/.test(token);
}

async function sendOrderStatusNotification({ fcm_token, order_number, status }) {
    if (!isExpoPushToken(fcm_token)) {
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
        const { data } = await axios.post(EXPO_PUSH_URL, message, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        const ticket = data?.data;
        if (ticket?.status === 'error') {
            console.error(`[PUSH] ✗ failed order #${order_number}:`, ticket.message);
        } else {
            console.log(`[PUSH] ✓ sent order #${order_number} (${status}) → ${ticket?.id}`);
        }
    } catch (err) {
        console.error(`[PUSH] ✗ failed order #${order_number}:`, err.message);
    }
}

module.exports = { sendOrderStatusNotification };

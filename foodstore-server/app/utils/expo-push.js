const axios = require('axios');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const STATUS_MAP = {
    processing: {
        emoji: '🔄',
        label: 'Pesanan Sedang Diproses',
        desc: 'Kami sedang menyiapkan pesananmu dengan penuh semangat!',
    },
    in_delivery: {
        emoji: '🚚',
        label: 'Pesanan Dalam Pengiriman',
        desc: 'Paket sudah dalam perjalanan menuju alamatmu. Tunggu ya!',
    },
    delivered: {
        emoji: '📦',
        label: 'Pesanan Telah Diterima',
        desc: 'Terima kasih sudah belanja di FoodStore! Jangan lupa beri ulasan ya 🌟',
    },
};

function isExpoPushToken(token) {
    return typeof token === 'string' && /^ExponentPushToken\[.+\]$/.test(token);
}

function formatRupiah(amount) {
    if (!amount) return null;
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

async function sendOrderStatusNotification({ fcm_token, order_number, status, total, item_count }) {
    if (!isExpoPushToken(fcm_token)) {
        console.warn(`[PUSH] skip — bukan Expo token: ${fcm_token}`);
        return;
    }

    const info = STATUS_MAP[status] || { emoji: '📋', label: status, desc: '' };

    const summaryParts = [];
    if (item_count) summaryParts.push(`${item_count} item`);
    if (total)      summaryParts.push(formatRupiah(total));

    const bodyLines = [`${info.emoji} ${info.label}`];
    if (summaryParts.length) bodyLines.push(summaryParts.join(' • '));
    bodyLines.push(info.desc);

    const message = {
        to: fcm_token,
        sound: 'default',
        badge: 1,
        title: `🍱 FoodStore — Order #${order_number}`,
        subtitle: 'Update Status Pesanan',
        body: bodyLines.join('\n'),
        mutableContent: true,
        priority: 'high',
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

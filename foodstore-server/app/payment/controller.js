const midtransClient = require('midtrans-client');
const mongoose = require('mongoose');
const Invoice = require('../invoice/model');
const Order = require('../order/model');

const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

async function getSnapToken(req, res, next) {
    try {
        const invoice = await Invoice
            .findOne({ order: req.params.order_id })
            .populate('user')
            .populate('order');

        if (!invoice) return res.json({ error: 1, message: 'Invoice tidak ditemukan' });
        if (invoice.payment_status === 'settlement') return res.json({ error: 1, message: 'Invoice sudah dibayar' });

        // Kembalikan token yang sudah ada agar tidak double charge
        if (invoice.snap_token) return res.json({ snap_token: invoice.snap_token });

        const parameter = {
            transaction_details: {
                order_id: String(invoice._id),
                gross_amount: invoice.total,
            },
            customer_details: {
                first_name: invoice.user?.full_name || 'Customer',
                email: invoice.user?.email || '',
            },
        };

        const { token } = await snap.createTransaction(parameter);
        invoice.snap_token = token;
        await invoice.save();

        return res.json({ snap_token: token });
    } catch (err) {
        next(err);
    }
}

async function handleNotification(req, res, next) {
    try {
        const { order_id, transaction_status, fraud_status } = req.body;

        // Abaikan payload kosong/order_id bukan valid ObjectId (misal test dari dashboard)
        if (!order_id || !transaction_status || !mongoose.Types.ObjectId.isValid(order_id)) {
            return res.json({ status: 'ok' });
        }

        let paymentStatus = 'waiting_payment';
        if (transaction_status === 'capture') {
            paymentStatus = fraud_status === 'accept' ? 'settlement' : 'failed';
        } else if (transaction_status === 'settlement') {
            paymentStatus = 'settlement';
        } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
            paymentStatus = 'failed';
        } else if (transaction_status === 'pending') {
            paymentStatus = 'pending';
        }

        const invoice = await Invoice.findByIdAndUpdate(
            order_id,
            { payment_status: paymentStatus },
            { new: true }
        );

        if (invoice && paymentStatus === 'settlement') {
            await Order.findByIdAndUpdate(invoice.order, { status: 'processing' });
        }

        return res.json({ status: 'ok' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSnapToken, handleNotification };

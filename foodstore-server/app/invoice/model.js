const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const invoiceSchema = Schema({

    sub_total: { type: Number },
    delivery_fee: { type: Number },
    delivery_address: {
        provinsi: { type: String },
        kabupaten: { type: String },
        kecamatan: { type: String },
        kelurahan: { type: String },
        detail: { type: String }
    },
    total: { type: Number },
    payment_status: { type: String, default: 'waiting_payment' },
    snap_token: { type: String, default: '' },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }
}, { timestamps: true });

module.exports = model('Invoice', invoiceSchema);

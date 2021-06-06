const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const orderSchema = Schema({
    status: {
        type: String,
        enum: ['waiting_payment', 'processing', 'in_delivery',
            'delivered'],
        default: 'waiting_payment'
    },
    delivery_fee: {
        type: Number,
        default: 0
    },
    delivery_address: {
        provinsi: { type: String, required: [true, 'provinsi harus diisi.'] },
        kabupaten: { type: String, required: [true, 'kabupaten harus diisi.'] },
        kecamatan: { type: String, required: [true, 'kecamatan harus diisi.'] },
        kelurahan: { type: String, required: [true, 'kelurahan harus diisi.'] },
        detail: { type: String }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    order_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]
}, { timestamps: true });

module.exports = model('Order', orderSchema);

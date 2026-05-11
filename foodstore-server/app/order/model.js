const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = Schema({
    status: {
        type: String,
        default: 'waiting_payment'
    },
    delivery_fee: {
        type: Number,
        default: 0
    },
    delivery_address: {
        provinsi: { type: String },
        kabupaten: { type: String },
        kecamatan: { type: String },
        kelurahan: { type: String },
        detail: { type: String }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    order_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]
}, { timestamps: true });

orderSchema.plugin(AutoIncrement, { inc_field: 'order_number' });

orderSchema.virtual('items_count').get(function () {
    return this.order_items.reduce((total, item) => {
        return total +
            parseInt(item.qty)
    }, 0)
});




module.exports = model('Order', orderSchema);

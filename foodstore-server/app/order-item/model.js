const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const orderItemSchema = Schema({
    name: { type: String },
    price: { type: Number },
    qty: { type: Number },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' }
});

module.exports = model('OrderItem', orderItemSchema);

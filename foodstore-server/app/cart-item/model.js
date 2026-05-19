const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
    qty: {
        type: Number,
        required: [true, 'qty harus diisi'],
        min: [1, 'minimal qty adalah 1'],
    },
    price: {
        type: Number,
        default: 0
    },
    name: String,
    image_url: String,
    checked: {
        type: Boolean,
        default: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
});

module.exports = model('CartItem', cartItemSchema);

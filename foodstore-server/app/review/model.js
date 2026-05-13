const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const reviewSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500, default: '' }
}, { timestamps: true });

// Satu user hanya bisa review satu produk sekali
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = model('Review', reviewSchema);

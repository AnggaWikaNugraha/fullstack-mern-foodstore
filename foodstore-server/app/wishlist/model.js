const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const wishlistSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = model('Wishlist', wishlistSchema);

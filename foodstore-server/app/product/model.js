
const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const productSchema = Schema({

    name: {
        type: String,
        required: [true, 'Nama makanan harus diisi']
    },

    description: {
        type: String,
        maxlength: [1000, 'Panjang deskripsi maksimal 1000 karakter']
    },

    price: {
        type: Number,
        default: 0
    },

    image_url: String,

    // ------- relation dengan Category ----//
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },

    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],

    avg_rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = model('Product', productSchema);

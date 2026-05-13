const Review = require('./model');
const Product = require('../product/model');

// POST /api/reviews — simpan rating dari user
async function create(req, res, next) {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Harus login untuk memberi rating' });

        const { product_id, order_id, rating, comment } = req.body;

        const review = await new Review({
            user: req.user._id,
            product: product_id,
            order: order_id,
            rating,
            comment
        }).save();

        // Hitung ulang rata-rata rating produk lalu update ke Product
        const allReviews = await Review.find({ product: product_id });
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(product_id, {
            avg_rating: Math.round(avg * 10) / 10,
            review_count: allReviews.length
        });

        return res.json(review);
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ error: 1, message: 'Kamu sudah memberi rating untuk produk ini' });
        }
        next(err);
    }
}

// GET /api/reviews?product_id=xxx&order_id=yyy
async function index(req, res, next) {
    try {
        const { product_id, order_id } = req.query;
        const filter = {};
        if (product_id) filter.product = product_id;
        if (order_id) filter.order = order_id;
        // Kalau ada user login + order_id, filter milik user itu saja
        if (order_id && req.user) filter.user = req.user._id;

        const reviews = await Review
            .find(filter)
            .populate('user', 'full_name')
            .sort('-createdAt');

        return res.json({ data: reviews, count: reviews.length });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, index };

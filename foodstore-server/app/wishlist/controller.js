const Wishlist = require('./model');

async function index(req, res, next) {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Harus login' });

        const items = await Wishlist
            .find({ user: req.user._id })
            .populate('product')
            .sort('-createdAt');

        return res.json({ data: items, count: items.length });
    } catch (err) {
        next(err);
    }
}

async function store(req, res, next) {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Harus login' });

        const { product_id } = req.body;
        const item = await new Wishlist({ user: req.user._id, product: product_id }).save();
        return res.json(item);
    } catch (err) {
        if (err.code === 11000) return res.json({ error: 1, message: 'Sudah ada di wishlist' });
        next(err);
    }
}

async function destroy(req, res, next) {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Harus login' });

        await Wishlist.findOneAndDelete({ user: req.user._id, product: req.params.product_id });
        return res.json({ message: 'Dihapus dari wishlist' });
    } catch (err) {
        next(err);
    }
}

module.exports = { index, store, destroy };

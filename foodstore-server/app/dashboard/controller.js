const Invoice = require('../invoice/model');
const Order = require('../order/model');
const OrderItem = require('../order-item/model');
const Product = require('../product/model');
const User = require('../user/model');

async function getSummary(req, res, next) {
    try {
        const [totalRevenue, totalOrders, totalProducts, totalUsers] = await Promise.all([
            Invoice.aggregate([
                { $match: { payment_status: { $in: ['settlement', 'paid', 'capture'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments(),
            Product.countDocuments(),
            User.countDocuments({ role: 'user' }),
        ]);

        return res.json({
            total_revenue: totalRevenue[0]?.total || 0,
            total_orders: totalOrders,
            total_products: totalProducts,
            total_users: totalUsers,
        });
    } catch (err) {
        next(err);
    }
}

async function getRevenueChart(req, res, next) {
    try {
        const days = 30;
        const from = new Date();
        from.setDate(from.getDate() - days);

        const data = await Invoice.aggregate([
            {
                $match: {
                    payment_status: { $in: ['settlement', 'paid', 'capture'] },
                    createdAt: { $gte: from },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return res.json({ data });
    } catch (err) {
        next(err);
    }
}

async function getTopProducts(req, res, next) {
    try {
        const data = await OrderItem.aggregate([
            { $group: { _id: '$product', total_qty: { $sum: '$qty' }, total_revenue: { $sum: { $multiply: ['$price', '$qty'] } } } },
            { $sort: { total_qty: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { name: '$product.name', image_url: '$product.image_url', total_qty: 1, total_revenue: 1 } },
        ]);

        return res.json({ data });
    } catch (err) {
        next(err);
    }
}

module.exports = { getSummary, getRevenueChart, getTopProducts };

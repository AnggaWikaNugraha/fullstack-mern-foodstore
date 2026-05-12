const { subject } = require('@casl/ability');
const Invoice = require('./model');
const { policyFor } = require('../policy');

async function show(req, res, next) {
    try {
        // (1) dapatkan _route_ params `order_id` 
        let { order_id } = req.params;

        // (2) dapatkan data `invoice` berdasarkan `order_id`
        let invoice = await Invoice
            .findOne({ order: order_id })
            .populate('order')
            .populate('user');

        // (1) deklarasikan `policy` untuk `user`
        let policy = policyFor(req.user);

        // (2) buat `subjectInvoice`
        let subjectInvoice = subject('Invoice', {
            ...invoice, user_id:
                invoice.user._id
        });

        // (3) cek policy `read` menggunakan `subjectInvoice`
        if (!policy.can('read', subjectInvoice)) {
            return res.json({
                error: 1,
                message: `Anda tidak memiliki akses untuk melihat invoice ini.`
            });
        }

        // (1) respon ke _client_
        return res.json(invoice);

    } catch (err) {
        return res.json({
            error: 1,
            message: `Error when getting invoice.`
        });
    }
}

async function index(req, res, next) {
    try {
        let { limit = 10, skip = 0 } = req.query;
        const filter = req.user?._id ? { user: req.user._id } : {};
        const count = await Invoice.countDocuments(filter);
        const invoices = await Invoice
            .find(filter)
            .populate('order')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip(parseInt(skip));
        return res.json({ data: invoices, count });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    show,
    index
}
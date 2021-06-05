const DeliveryAddress = require('./model');
const { policyFor } = require('../policy');

async function store(req, res, next) {
    let policy = policyFor(req.user);

    if (!policy.can('create', 'DeliveryAddress')) {

        return res.json({
            error: 1,
            message: `You're not allowed to perform this action`
        });
    }

    try {

        let payload = req.body;

        let user = req.user;

        // (1) buat instance `DeliveryAddress` berdasarkan payload dan data`user`
        let address = new DeliveryAddress({ ...payload, user: user._id });

        // (2) simpan ke instance di atas ke MongoDB
        await address.save();

        // (3) respon dengan data `address` dari MongoDB
        return res.json(address);


    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }

}

module.exports = {
    store
}
// (1) import model `Product`
const Product = require('./model');

async function store(req, res, next) {
    let payload = req.body;
    // bikin baru
    let product = new Product(payload)
    await product.save()
    return res.json(product)
}

module.exports = {
    store
}
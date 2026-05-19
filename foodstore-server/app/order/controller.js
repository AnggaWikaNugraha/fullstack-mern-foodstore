const mongoose = require("mongoose");
const Order = require("./model");
const OrderItem = require("../order-item/model");
const CartItem = require("../cart-item/model");
const DeliveryAddress = require("../delivery-address/model");
const Invoice = require("../invoice/model");
const Product = require("../product/model");
const { policyFor } = require("../policy");
const { subject } = require("@casl/ability");
const { sendOrderConfirmation } = require("../utils/mailer");
const pusher = require("../pusher");

async function store(req, res, next) {
  // (1) dapatkan policy untuk user yang sedang login
  let policy = policyFor(req.user);

  // (2) cek apakah policy mengizinkan untuk membuat order
  // if (!policy.can('create', 'Order')) {
  //     return res.json({
  //         error: 1,
  //         message: `You're not allowed to perform this action`
  //     });
  // }

  try {
    let { delivery_fee, delivery_address } = req.body;

    // (1) Dapatkan `items` di keranjang belanja
    let items = await CartItem
      .find({ user: req.user._id })
      .populate("product");

    let address = await DeliveryAddress.findOne({ _id: delivery_address });

    // create order but don't save it yet.
    // using mongoose.Types.ObjectId() to generate id for saving ref
    let order = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });

    // Simpan snapshot item order langsung ke collection agar checkout
    // tidak gagal karena validasi schema item yang tidak relevan saat order dibuat.
    let orderItems = items.map((item) => {
      let product = item.product || {};

      return {
        _id: new mongoose.Types.ObjectId(),
        name: product.name || item.name,
        qty: parseInt(item.qty),
        price: parseInt(product.price || item.price),
        order: order._id,
        product: product._id || item.product,
      };
    });

    await OrderItem.collection.insertMany(orderItems);

    orderItems.forEach((item) => order.order_items.push(item._id));

    await order.save();

    const sub_total = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    await new Invoice({
        user: req.user._id,
        order: order._id,
        sub_total,
        delivery_fee: parseInt(delivery_fee) || 0,
        total: sub_total + (parseInt(delivery_fee) || 0),
        delivery_address: order.delivery_address,
    }).save();

    const LOW_STOCK_THRESHOLD = 5;

    // Kurangi stok untuk setiap produk yang dipesan
    for (const item of orderItems) {
      if (item.product) {
        const updated = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.qty } },
          { new: true }
        );
        if (updated && updated.stock <= LOW_STOCK_THRESHOLD) {
          pusher.trigger('private-admin', 'product:low_stock', {
            product_id: String(updated._id),
            product_name: updated.name,
            stock: updated.stock,
          }).catch(() => {});
        }
      }
    }

    // clear cart items
    await CartItem.deleteMany({ user: req.user._id });

    // Kirim email konfirmasi — fire-and-forget, tidak blok response
    if (req.user?.email) {
      sendOrderConfirmation({
        to: req.user.email,
        order_number: order.order_number,
        full_name: req.user.full_name || req.user.email,
        items: orderItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        sub_total,
        delivery_fee: parseInt(delivery_fee) || 0,
        total: sub_total + (parseInt(delivery_fee) || 0),
      });
    }

    return res.json(order);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
}

async function index(req, res, next) {
  try {
    let { limit = 10, skip = 0, status } = req.query;
    let query = {};
    if (status) query.status = status;

    let count = await Order.find(query).countDocuments();
    let orders = await Order.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("order_items")
      .populate("user", "full_name email")
      .sort("-createdAt");

    return res.json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
      count,
    });
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ error: 1, message: 'Admin only' });
    }
    const result = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const by_status = {};
    let total = 0;
    result.forEach(({ _id, count }) => { by_status[_id] = count; total += count; });
    return res.json({ total, by_status });
  } catch (err) {
    next(err);
  }
}

async function exportAll(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ error: 1, message: 'Admin only' });
    }
    const orders = await Order.find()
      .populate('order_items')
      .populate('user', 'full_name email')
      .sort('-createdAt');
    return res.json({ data: orders.map(o => o.toJSON({ virtuals: true })) });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('order_items')
      .populate('user', 'full_name email');

    if (!order) return res.json({ error: 1, message: 'Order tidak ditemukan' });

    const invoice = await Invoice.findOne({ order: order._id });

    return res.json({
      ...order.toJSON({ virtuals: true }),
      invoice: invoice ? {
        payment_status: invoice.payment_status,
        total: invoice.total,
        sub_total: invoice.sub_total,
      } : null,
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ error: 1, message: 'Admin only' });
    }

    const { status } = req.body;
    const allowed = ['processing', 'in_delivery', 'delivered'];
    if (!allowed.includes(status)) {
      return res.json({ error: 1, message: 'Status tidak valid' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.json({ error: 1, message: 'Order tidak ditemukan' });

    pusher.trigger(`private-order-${order._id}`, 'order:status_updated', {
        order_id: String(order._id),
        status: order.status,
    }).catch(() => {});

    return res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  store,
  index,
  stats,
  exportAll,
  show,
  updateStatus,
};

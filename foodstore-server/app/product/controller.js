const Product = require("./model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const { policyFor } = require("../policy");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

async function store(req, res, next) {
  try {
    //--- cek policy ---/
    let policy = policyFor(req.user);
  
    // cari do plicy for yg bisa create product
    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat produk`,
      });
    }

    let payload = req.body;

    if (payload.tags && payload.tags.length) {
      // cari Tag berdasarkan nama Tag yang terdapat pada payload.tags
      // $in operator Mongoose query
      // contoh : payload.tags bernilai ['coffee', 'hot'],
      // maka Mongoose akan mencari di collection Tag semua data tag yang memiliki nama coffee atau hot
      let tags = await Tag.find({ name: { $in: payload.tags } });

      // (1) cek apakah tags membuahkan hasil
      if (tags.length) {
        // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    // cari relasi category
    if (payload.category) {
      let category = await Category
        // temukan satu category berdasarkan name , kemudian cocokkan dengan payload category dengan incessensitive
        .findOne({ name: { $regex: payload.category, $options: "i" } });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      payload = { ...payload, image_url: result.secure_url };
    }

    let product = new Product(payload);
    await product.save();
    return res.json(product);

  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({ error: 1, message: err.message, fields: err.errors });
    }
    next(err);
  }
}

async function index(req, res, next) {
  try {
    // limit , jumlah data
    // skip,  page keberapa
    let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;

    let criteria = {};

    if (q.length) {
      criteria = {
        ...criteria,
        // masukan nama ke dalam criteria
        name: { $regex: `${q}`, $options: "i" },
      };
    }

    if (category.length) {
      category = await Category.findOne({
        name: { $regex: `${category}`, $options: "i" },
      });
      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }

    if (tags.length) {
      tags = await Tag.find({ name: { $in: tags } });
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }

    let count = await Product.find(criteria).countDocuments();

    let products = await Product.find(criteria)
      .limit(parseInt(limit)) // <---
      .skip(parseInt(skip)) // <---
      .populate("category")
      .populate("tags")
      .select("-__v");
    return res.json({ data: products, count }); // <--- perubahan 2
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    let policy = policyFor(req.user);
    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat produk`,
      });
    }

    let payload = req.body;
    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      // (1) cek apakah tags membuahkan hasil
      if (tags.length) {
        // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      // Hapus gambar lama dari Cloudinary, lalu upload yang baru
      const existing = await Product.findById(req.params.id);
      if (existing?.image_url) await deleteFromCloudinary(existing.image_url);

      const result = await uploadToCloudinary(req.file.buffer);
      payload = { ...payload, image_url: result.secure_url };
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true, runValidators: true }
    );
    return res.json(product);

  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({ error: 1, message: err.message, fields: err.errors });
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    //--- cek policy ---/
    let policy = policyFor(req.user);
    if (!policy.can("delete", "Product")) {
      // <-- can delete
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus produk`,
      });
    }

    let product = await Product.findOneAndDelete({ _id: req.params.id });

    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.json({
      message: "Berhasil delete",
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  index, // <---
  store,
  update, // <---
  destroy,
};

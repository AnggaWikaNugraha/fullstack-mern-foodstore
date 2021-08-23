const Category = require("./model");
const { policyFor } = require("../policy");

async function index(req, res, next) {
  try {
    // limit , jumlah data
    // skip,  page keberapa
    let { limit = 10, skip = 0 } = req.query;

    let category = await Category.find()
      .limit(parseInt(limit)) // <---
      .skip(parseInt(skip)); // <---

    return res.json({ data: category });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    let policy = policyFor(req.user);
    // if (!policy.can('create', 'Category')) { // <-- can create Category
    //     return res.json({
    //         error: 1,
    //         message: `Anda tidak memiliki akses untuk membuat kategori`
    //     });
    // }
    // (1) tangkap payload dari _client request_
    let payload = req.body;

    // (2) buat category baru dengan model Category;

    let category = new Category(payload);

    // (3) simpan category baru tadi ke MongoDB
    await category.save();

    // (4) respon ke client dengan data category yang baru dibuat.
    return res.json(category);
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    // (2) tangkap jika terjadi kesalahan kemudian gunakan method `next` agar Express memproses error tersebut
    next(err);
  }
}

async function update(req, res, next) {
  try {
    //--- cek policy ---/
    let policy = policyFor(req.user);
    if (!policy.can("update", "Category")) {
      // <-- can update Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate kategori`,
      });
    }
    // (1) tangkap payload dari _client request_
    let payload = req.body;

    let category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    // (4) respon ke client dengan data category yang baru dibuat.
    return res.json(category);
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    // (2) tangkap jika terjadi kesalahan kemudian gunakan method `next` agar Express memproses error tersebut
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    //--- cek policy ---/
    let policy = policyFor(req.user);
    if (!policy.can("delete", "Category")) {
      // <-- can delete Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus kategori`,
      });
    }

    // (1) cari dan hapus categori di MongoDB berdasarkan field _id
    let deleted = await Category.findOneAndDelete({
      _id: req.params.id,
    });

    // (2) respon ke client dengan data category yang baru saja dihapus
    return res.json(deleted);
  } catch (err) {
    // (3) handle kemungkinan error
    next(err);
  }
}

module.exports = {
  index,
  store,
  update, // <--
  destroy,
};

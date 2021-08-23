const { getToken } = require("../utils/get-token");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../user/model");

function decodeToken() {
  return async function (req, res, next) {
    try {
      // tangkap token
      let token = getToken(req);
      console.log(req);

      // jika token tida ada
      if (!token) return next(); // <---

      // decode tokennya
      // simpan hasil nya ke req.user
      // jwt verivy check token expires
      const decode = jwt.verify(token, config.secretKey); // <---
      req.user = decode;

      // cari user berdasarkan token
      let user = await User.findOne({ token: { $in: [token] } });
      // console.log(user);

      //-- token expired jika User tidak ditemukan --//
      if (!user) {
        return res.json({
          error: 1,
          message: `Token expired`,
        });
      }
    } catch (err) {
      // (1) tangani error yang terkait JsonWebTokenError
      if (err && err.name === "JsonWebTokenError") {
        return res.json({
          error: 1,
          message: err.message,
        });
      }
      // (2) tangani error lainnya
      next(err);
    }
    return next(); // <--
  };
}

module.exports = {
  decodeToken,
};

const User = require("../user/model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

const { getToken } = require("../utils/get-token");

async function register(req, res, next) {
  try {
    // (1) tangkap payload dari request
    const payload = req.body;

    // (2) buat objek user baru
    let user = new User(payload);

    // (3) simpan user baru ke MongoDB
    await user.save();

    // (4) berikan response ke client
    return res.json({
      data: user,
    });
  } catch (err) {
    // (1) cek kemungkinan kesalahan terkait validasi
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    // (2) error lainnya
    next(err);
  }
}

// cocokkan passwprd saat login dengan email yg dicari ke collection DB
async function localStrategy(email, password, done) {
  try {
    let user = await User.findOne({ email })

      // pilih yg tidak mau di munculkan dengan menggunakan minus
      .select("-__v -createdAt -updatedAt -cart_items -token");

    if (!user) return done();

    // user sudah d temukan kemudian cocokkan password
    // jika password sama
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, { ...userWithoutPassword, has_password: true });
    }
  } catch (err) {
    done(err, null);
  }
  done(); // <---
}

async function login(req, res, next) {
  passport.authenticate("local", async function (err, user) {
    // jika error dari localstrategy
    if (err) return next(err);

    if (!user)
      return res.json({ error: 1, message: "email or password incorrect" }); // <--

    // (1) buat JSON Web Token dan menyimpannya ke atribut user
    // signed adalah berupa token
    let signed = jwt.sign(user, config.secretKey);
    // (2) simpan token tersebut ke user terkait
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          token: signed,
        },
      },
      { new: true }
    );

    // (3) response ke _client_
    return res.json({
      message: "logged in successfully",
      user: user,
      token: signed,
    });
  })(req, res, next);
}

function me(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`,
    });
  }
  return res.json(req.user);
}

async function logout(req, res, next) {
  let token = getToken(req);

  // (2) hapus `token` dari `User`
  let user = await User.findOneAndUpdate(
    { token: { $in: [token] } },
    { $pull: { token } },
    { useFindAndModify: false }
  );

  // // --- cek user atau token ---//
  if (!user || !token) {
    return res.json({
      error: 1,
      message: "No user found",
    });
  }
  return res.json({
    error: 0,
    message: "Logout berhasil",
  });
}

async function googleStrategy(accessToken, refreshToken, profile, done) {
  try {
    const email = profile.emails[0].value;
    const google_id = profile.id;

    // cari user by google_id dulu (sudah pernah login Google)
    let user = await User.findOne({ google_id });

    if (!user) {
      // cari by email (akun sudah ada tapi belum pernah login Google)
      user = await User.findOne({ email });

      if (user) {
        // merge — tambahkan google_id ke akun yang sudah ada
        await User.findByIdAndUpdate(user._id, { google_id });
      } else {
        // belum punya akun sama sekali — buat baru
        user = await User.create({
          full_name: profile.displayName,
          email,
          google_id,
          password: null,
        });
      }
    }

    const { password, token: tokenArr, __v, createdAt, updatedAt, ...userWithoutPassword } = user.toJSON();
    return done(null, { ...userWithoutPassword, has_password: !!password });
  } catch (err) {
    return done(err, null);
  }
}

function googleCallback(req, res) {
  const user = req.user;
  const signed = jwt.sign(user, config.secretKey);

  User.findOneAndUpdate(
    { _id: user._id },
    { $addToSet: { token: signed } }
  ).catch(() => {});

  // redirect ke frontend dengan token di query param
  res.redirect(`${process.env.CLIENT_URL}/#/auth/callback?token=${signed}`);
}

module.exports = {
  register,
  localStrategy,
  googleStrategy,
  googleCallback,
  login,
  me,
  logout,
};

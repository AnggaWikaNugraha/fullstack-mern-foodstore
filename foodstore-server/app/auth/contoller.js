const User = require("../user/model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const config = require("../config");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { getToken } = require("../utils/get-token");
const { sendVerificationEmail } = require("../utils/mailer");

async function register(req, res, next) {
  try {
    const payload = req.body;

    // generate token unik untuk verifikasi
    const verification_token = crypto.randomBytes(32).toString('hex');
    const verification_token_expired = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    let user = new User({
      ...payload,
      verified: false,
      verification_token,
      verification_token_expired,
    });

    await user.save();

    const verification_link = `${process.env.CLIENT_URL}/#/verify-email?token=${verification_token}`;
    await sendVerificationEmail({ to: user.email, full_name: user.full_name, verification_link });

    return res.json({ message: 'Register success' });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
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

    if (user.verified !== true) {
      const verification_token = crypto.randomBytes(32).toString('hex');
      const verification_token_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(user._id, { verification_token, verification_token_expired });
      const verification_link = `${process.env.CLIENT_URL}/#/verify-email?token=${verification_token}`;
      await sendVerificationEmail({ to: user.email, full_name: user.full_name, verification_link });
      return done(null, false, { message: 'email_not_verified' });
    }

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
  passport.authenticate("local", async function (err, user, info) {
    if (err) return next(err);

    if (!user) {
      const message = info?.message === 'email_not_verified'
        ? 'email_not_verified'
        : 'email or password incorrect';
      return res.json({ error: 1, message });
    }

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

async function me(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`,
    });
  }
  try {
    const user = await User.findById(req.user._id)
      .select("-password -token -__v -createdAt -updatedAt");
    if (!user) return res.json({ error: 1, message: "User tidak ditemukan" });
    return res.json({ ...user.toJSON(), has_password: !!user.password });
  } catch (err) {
    next(err);
  }
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

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.json({ error: 1, message: 'Email harus diisi' });

    const user = await User.findOne({ email });

    if (!user) return res.json({ error: 1, message: 'Email tidak ditemukan' });
    if (user.verified === true) return res.json({ error: 1, message: 'Akun sudah terverifikasi, silakan login' });

    const verification_token = crypto.randomBytes(32).toString('hex');
    const verification_token_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { verification_token, verification_token_expired });

    const verification_link = `${process.env.CLIENT_URL}/#/verify-email?token=${verification_token}`;
    await sendVerificationEmail({ to: user.email, full_name: user.full_name, verification_link });

    return res.json({ message: 'Link verifikasi sudah dikirim ulang' });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verification_token: token,
      verification_token_expired: { $gt: new Date() },
    });

    if (!user) {
      return res.json({ error: 1, message: 'Link verifikasi tidak valid atau sudah expired' });
    }

    await User.findByIdAndUpdate(user._id, {
      verified: true,
      verification_token: null,
      verification_token_expired: null,
    });

    return res.json({ message: 'Akun berhasil diverifikasi' });
  } catch (err) {
    next(err);
  }
}

async function googleStrategy(accessToken, refreshToken, profile, done) {
  try {
    const email = profile.emails[0].value;
    const google_id = profile.id;

    // cari user by google_id dulu (sudah pernah login Google)
    let user = await User.findOne({ google_id });

    if (!user) {
      // cari by email — akun sudah ada tapi belum pernah login Google
      user = await User.findOne({ email });

      const image_url = profile.photos?.[0]?.value || null;

      if (user) {
        // merge — tambahkan google_id dan foto ke akun yang sudah ada
        await User.findByIdAndUpdate(user._id, { google_id, image_url });
        user = await User.findById(user._id);
      } else {
        // belum punya akun — buat baru, verified: false dulu
        user = await User.create({
          full_name: profile.displayName,
          email,
          google_id,
          image_url,
          password: null,
          verified: false,
        });
      }
    }

    // cek verified — apapun cara masuknya
    if (user.verified !== true) {
      // kirim ulang verification email
      const verification_token = crypto.randomBytes(32).toString('hex');
      const verification_token_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(user._id, { verification_token, verification_token_expired });

      const verification_link = `${process.env.CLIENT_URL}/#/verify-email?token=${verification_token}`;
      await sendVerificationEmail({ to: user.email, full_name: user.full_name, verification_link });

      // kirim marker ke googleCallback bahwa user belum verified
      return done(null, { _not_verified: true, email: user.email });
    }

    const { password, token: tokenArr, __v, createdAt, updatedAt, ...userWithoutPassword } = user.toJSON();
    return done(null, { ...userWithoutPassword, has_password: !!password });
  } catch (err) {
    return done(err, null);
  }
}

function googleCallback(req, res) {
  const user = req.user;

  // user belum verified — redirect ke halaman cek email
  if (user._not_verified) {
    return res.redirect(`${process.env.CLIENT_URL}/#/cek-email`);
  }

  const signed = jwt.sign(user, config.secretKey);

  User.findOneAndUpdate(
    { _id: user._id },
    { $addToSet: { token: signed } }
  ).catch(() => {});

  res.redirect(`${process.env.CLIENT_URL}/#/auth/callback?token=${signed}`);
}

async function googleMobileLogin(req, res, next) {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.json({ error: 1, message: 'id_token harus diisi' });

    // verifikasi id_token dari Google SDK mobile
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email    = payload.email;
    const google_id = payload.sub;
    const full_name = payload.name;

    // merge logic — sama seperti googleStrategy
    let user = await User.findOne({ google_id });

    if (!user) {
      user = await User.findOne({ email });
      const image_url = payload.picture || null;
      if (user) {
        await User.findByIdAndUpdate(user._id, { google_id, image_url });
        user = await User.findById(user._id);
      } else {
        user = await User.create({ full_name, email, google_id, image_url, password: null, verified: false });
      }
    }

    // cek verified
    if (user.verified !== true) {
      const verification_token = crypto.randomBytes(32).toString('hex');
      const verification_token_expired = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(user._id, { verification_token, verification_token_expired });
      const verification_link = `${process.env.CLIENT_URL}/#/verify-email?token=${verification_token}`;
      await sendVerificationEmail({ to: user.email, full_name: user.full_name, verification_link });
      return res.json({ error: 1, message: 'email_not_verified', email: user.email });
    }

    const { password, token: tokenArr, __v, createdAt, updatedAt, ...userClean } = user.toJSON();
    const userPayload = { ...userClean, has_password: !!password };
    const signed = jwt.sign(userPayload, config.secretKey);
    await User.findByIdAndUpdate(user._id, { $addToSet: { token: signed } });

    return res.json({ message: 'logged in successfully', user: userPayload, token: signed });
  } catch (err) {
    if (err.message?.includes('Invalid token')) {
      return res.json({ error: 1, message: 'id_token tidak valid atau sudah expired' });
    }
    next(err);
  }
}

module.exports = {
  register,
  localStrategy,
  googleStrategy,
  googleCallback,
  googleMobileLogin,
  verifyEmail,
  resendVerification,
  login,
  me,
  logout,
};

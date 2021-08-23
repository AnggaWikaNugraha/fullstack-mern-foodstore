// (1) import package yang diperlukan
const router = require("express").Router();
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const controller = require("./contoller");
passport.use(
  new LocalStrategy({ usernameField: "email" }, controller.localStrategy)
);

// (3) buat endpoint untuk register user baru
// multer untuk jenis form-data
router.post("/register", multer().none(), controller.register);
router.post("/login", multer().none(), controller.login);
router.get("/me", controller.me);
router.post("/logout", controller.logout);

// (4) export router
module.exports = router;

const router = require("express").Router();
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const controller = require("./contoller");

passport.use(
  new LocalStrategy({ usernameField: "email" }, controller.localStrategy)
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    controller.googleStrategy
  )
);

router.post("/register", multer().none(), controller.register);
router.post("/login", multer().none(), controller.login);
router.get("/me", controller.me);
router.post("/logout", controller.logout);

router.get("/verify-email/:token", controller.verifyEmail);
router.post("/resend-verification", controller.resendVerification);

// Google OAuth — web (redirect flow)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/#/login?error=google_failed`, session: false }), controller.googleCallback);

// Google OAuth — mobile (id_token flow, untuk Flutter / React Native)
router.post("/google/mobile", multer().none(), controller.googleMobileLogin);

module.exports = router;

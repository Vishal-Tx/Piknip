const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user")

const passport = require("passport");
const user = require("../controllers/users");
const { isLoggedIn, isAccountOwner } = require("../middleware");

const { storage2 } = require("../cloudinary")
const multer = require('multer')
const upload = multer({ storage: storage2 })

router
  .route("/register")
  .get(user.renderRegister)
  .post(upload.single("avatar"), catchAsync(user.register));



router.route("/users/:id")
  .get(user.renderProfile)
  .put(isLoggedIn, isAccountOwner, upload.single("newAvatar"),  catchAsync(user.updateProfile))
  .delete(isLoggedIn, isAccountOwner, catchAsync(user.deleteProfile));


router
  .route("/login")
  .get(user.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      keepSessionInfo: true,
    }),
    user.login
  );

router.get("/logout", user.logout);
module.exports = router;

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validatePicnicspot, isAuthor } = require("../middleware");
const picnicspot = require("../controllers/picnicspots");
const { storage1 } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage: storage1 });

router
  .route("/")
  .get(catchAsync(picnicspot.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validatePicnicspot,
    catchAsync(picnicspot.createPicnicspot)
  );

router.post("/searchItem/search", picnicspot.searchPicnicspot);

router.get("/new", isLoggedIn, picnicspot.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(picnicspot.showPicnicspot))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validatePicnicspot,
    catchAsync(picnicspot.updatePicnicspot)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(picnicspot.deletePicnicspot));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(picnicspot.renderEditForm)
);

module.exports = router;

const PicnicSpot = require("../models/picnicspot");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

exports.index = async (req, res) => {
  const picnicspots = await PicnicSpot.find({});
  res.render("picnicspots/index", { picnicspots });

  // console.log(PicnicSpot);
};

exports.renderNewForm = (req, res) => {
  res.render("picnicspots/new");
};

exports.createPicnicspot = async (req, res, next) => {
  console.log("req.body.picnicspot=", req.body);
  // console.log('req.user=', req.user)

  // if(!req.body.picnicspot) throw new ExpressError("Invalid Picnicspot Data", 400)

  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.picnicspot.location,
      limit: 1,
    })
    .send();

  console.log(
    "geoData.body.features.context",
    geoData.body.features[0].context
  );
  console.log(
    "geoData.body.features.geometry.coordinates",
    geoData.body.features[0].geometry.coordinates
  );
  // res.send("ok")

  const picnicspot = new PicnicSpot(req.body.picnicspot);
  picnicspot.geometry = geoData.body.features[0].geometry;
  console.log("req.file", req.files);
  picnicspot.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // console.log('picnicspot.images', picnicspot.images)
  picnicspot.author = req.user._id;
  await picnicspot.save();
  // console.log(picnicspot)
  req.flash("success", "Sucessfully made a new Picnicspot.");
  res.redirect(`/picnicspots/${picnicspot._id}`);
};

exports.showPicnicspot = async (req, res) => {
  // console.log(req.params.id)
  const picnicspot = await PicnicSpot.findById(req.params.id)
    .populate("author")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });
  // console.log('picnicspot*******', picnicspot)
  if (!picnicspot) {
    req.flash("error", "Cannot find the Picnicspot");
    return res.redirect("/picnicspots");
  }
  res.render("picnicspots/show", { picnicspot });
};

exports.renderEditForm = async (req, res) => {
  const picnicspot = await PicnicSpot.findById(req.params.id);
  if (!picnicspot) {
    req.flash("error", "Cannot find the Picnicspot");
    return res.redirect("/picnicspots");
  }
  res.render("picnicspots/edit", { picnicspot });
};

exports.updatePicnicspot = async (req, res) => {
  const { id } = req.params;
  const { deleteImages } = req.body;
  // console.log(req.body)
  const picnicspot = await PicnicSpot.findByIdAndUpdate(id, {
    ...req.body.picnicspot,
  });
  const images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  picnicspot.images.push(...images);
  await picnicspot.save();
  if (deleteImages) {
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await picnicspot.updateOne({
      $pull: { images: { filename: { $in: deleteImages } } },
    });
  }
  req.flash("success", "Sucessfully updated Picnicspot!.");
  res.redirect(`/picnicspots/${picnicspot._id}`);
};

exports.deletePicnicspot = async (req, res) => {
  const { id } = req.params;
  const picnicspotDelete = await PicnicSpot.findById(id);

  for (let image of picnicspotDelete.images) {
    await cloudinary.uploader.destroy(image.filename);
    // console.log('filename%$#', image.filename)
  }

  const picnicspot = await PicnicSpot.findByIdAndDelete(id);
  req.flash("success", `Sucessfully deleted the Picnicspot.`);
  res.redirect("/picnicspots");
};

const PicnicSpot = require("../models/picnicspot.js");
const Review = require("../models/review.js");

exports.createReview = async (req, res) => {
    const picnicspot = await PicnicSpot.findById(req.params.id);
    // console.log(req.body);
    const review = await new Review(req.body.review)
    review.author = req.user._id;
    review.picnicspot = picnicspot.id
    picnicspot.reviews.push(review)
    await review.save()
    await picnicspot.save()
    req.flash("success", "Created a new Review.")
    res.redirect(`/picnicspots/${picnicspot._id}`);
}


exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await PicnicSpot.findByIdAndUpdate(id, { $pull: { reviews: { _id: reviewId } } })
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash("success", "Sucessfully deleted the Review.")
    res.redirect(`/picnicspots/${id}`)
}
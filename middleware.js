const ExpressError = require("./utils/ExpressError")
const PicnicSpot = require("./models/picnicspot.js");
const Review = require("./models/review")
const User = require("./models/user")
const { picnicspotSchema, reviewSchema } = require("./schema")


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validatePicnicspot = (req, res, next) => {
    const { value, error } = picnicspotSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(ele => ele.message).join(",")
        // console.log(error);
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    // console.log(req.body.picnicspot);
    const picnicspot = await PicnicSpot.findById(id);
    if (!picnicspot.author.equals(req.user._id)) {
        req.flash("error", "You do not have Premission to do that.")
        return res.redirect(`/picnicspots/${picnicspot._id}`)
    }
    else {
        next();
    }
}

module.exports.isAccountOwner = async(req, res, next)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user._id.equals(req.user._id)){
        return res.redirect(`/users/${user._id}`)
    }
    else{
        next()
    }

}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    // console.log(req.body.picnicspot);
    const review = await Review.findById(reviewId);
    // console.log('review***********', review)
    // console.log("req.user._id", req.user._id)
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have Premission to do that.")
        return res.redirect(`/picnicspots/${picnicspot._id}`)
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(ele => ele.message).join(",")
        console.log(error);
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}
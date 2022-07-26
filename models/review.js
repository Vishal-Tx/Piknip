const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    picnicspot: {
        type: Schema.Types.ObjectId,
        ref: "PicnicSpot"
    }
})

module.exports = mongoose.model("Review", reviewSchema)
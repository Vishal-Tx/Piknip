const mongoose = require("mongoose");
let review = require("./review");
let Review = require("./review").schema;
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
  url: String,
  filename: String,
})

ImageSchema.virtual("thumbnail").get(function() {
  return this.url.replace("/upload", "/upload/w_200,h_135,c_fill")
})

ImageSchema.virtual("slideShow").get(function() {
  return this.url.replace("/upload", "/upload/w_390,h_280,c_fill")
})

const opts = { toJSON: { virtuals: true } };

const PicnicSpotSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [Review],
}, opts);

PicnicSpotSchema.virtual("properties.popupText").get(function() {
  return `<strong><a href="/picnicspots/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`
})


PicnicSpotSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    for (rev of doc.reviews) {
      await review.deleteMany({
        _id: {
          $in: rev,
        },
      });
    }
  }

  // if(doc){
  //     await Review.remove({_id: { }})
  // }
});



module.exports = mongoose.model("PicnicSpot", PicnicSpotSchema);

// console.log(module.exports);

const mongoose = require('mongoose');
const Review = require("../models/review.js");



mongoose.connect("mongodb://localhost:27017/pik-nip", {
    
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const emptyReview = async ()=>{
   await Review.deleteMany({})
   .then(console.log("Successfully deleted"))
}

emptyReview();
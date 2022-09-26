require('dotenv').config()
const mongoose = require('mongoose');
const cities = require("./cities");
const { places, descriptors } = require('./seedHelpers');
const PicnicSpot = require("../models/picnicspot.js");

mongoose.connect(process.env.DB_URL || "mongodb://localhost:27017/pik-nip", {

    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await PicnicSpot.deleteMany({});
    for (let i = 0; i <= 200; i++) {
        const randomcity = Math.floor(Math.random() * 406)
        const price = Math.floor(Math.random() * 200) + 10;
        const p = new PicnicSpot({
            author: "63319d4b2b80780e11cd3484",
            location: `${cities[randomcity].city}, ${cities[randomcity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis pariatur voluptatibus sint consequuntur? Nostrum maxime, corrupti ea sequi corporis possimus ad aliquid id vel facilis, quidem repellat tempore dolorum voluptatibus.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomcity].longitude,
                    cities[randomcity].latitude,
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dzmbgzot8/image/upload/v1657994985/Piknip/i8xjmbdd9ntzdz5kjvaj.jpg',
                  filename: 'Piknip/i8xjmbdd9ntzdz5kjvaj',
                },
                {
                  url: 'https://res.cloudinary.com/dzmbgzot8/image/upload/v1657975577/Piknip/uxwzfwvelobv84jifymn.webp',
                  filename: 'Piknip/uxwzfwvelobv84jifymn',
                }
            ]
        })
        await p.save();
    }

}

seedDB()
.then(console.log("Database seeded"));
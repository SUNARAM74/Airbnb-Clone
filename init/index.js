const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const Mongo_url = "mongodb://127.0.0.1:27017/Airbnb";

main()
 .then(() => {
    console.log('Successfully Connected Mongoose');
 })
 .catch((err) => {
    console.log(err);
 })

async function main() {
    await mongoose.connect(Mongo_url);
}

const initDB = async () => {
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({ ...obj, owner: "6532b482a4e7bbebc8c4a9aa", }));
   await Listing.insertMany(initData.data)
   console.log("data was initialized ...");
}

initDB();
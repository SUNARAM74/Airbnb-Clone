const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');

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

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views") );
app.use(express.urlencoded({extended: true}));
// method-override middleware
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', engine);

// Edit Page Route ↓
app.get("/listings/edit/:id", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

// Delete Route ↓
app.delete("/listings/fire/:id", async (req, res) => {
    let { id } = req.params;
    const deleteList = await Listing.findByIdAndDelete(id);
    console.log(deleteList);
    res.redirect("/listings");
});

// Update Route ↓
app.put("/listings/update/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

// Create Page Route ↓
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create Route ↓
app.post("/listings/create", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// Show Route ↓
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

// Index Route ↓
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

// app.get("/testListing", async (req, res) => {
//     let simpleData = new Listing({
//         title: "My new house",
//         description: "Near to Brahmapura River",
//         price: 12000,
//         location: "Guwahati, Assam",
//         country: "India"
//     });
//     await simpleData.save();
//     console.log("Testing Success ..");
//     res.send("Your Data is Saved in DB");
// });

app.get("/", (req, res) => {
    res.send("home.ejs");
});

app.listen(8080, () => {
    console.log("listning port 8080");
});
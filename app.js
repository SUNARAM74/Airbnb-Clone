const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExError = require("./utils/ExError.js");
const { listingSchema, reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');

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
app.use(methodOverride('_method'));      // method-override middleware
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', engine);

const validateListing = ((req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExError(400, errMsg);
    }
    else {
        next();
    }
});

const validateReview = ((req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExError(400, errMsg);
    }
    else {
        next();
    }
});

// Root Route ↓
app.get("/", (req, res) => {
    res.send("Hi, I Am Root 🙏");
});

// Edit Page Route ↓
app.get("/listings/edit/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// Delete Route ↓
app.delete("/listings/fire/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// Reviews Delete Route ↓
app.delete("/listings/fire/:id/reviews/:reviewId", wrapAsync( async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate( id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete( reviewId );

    res.redirect(`/listings/${id}`);
}));

// Reviews Post Route ↓
app.post("/listings/:id/reviews", 
 validateReview, 
  wrapAsync( async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing.id}`);
}));

// Update Route ↓
app.put("/listings/update/:id",
 validateListing,
  wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Create Page Route ↓
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create Route ↓
app.post("/listings/create",
 validateListing,
  wrapAsync ( async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show with Reviews Route ↓
app.get("/listings/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

// Index Route ↓
app.get("/listings",  async (req, res) => {
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

// Random Page Error Handling Middle Ware ↓
app.all("*", (req, res, next) => {
    next(new ExError(404, "Page Not Found !!!"));
});

// Wrong Data Insert Error Handling Middle Ware ↓
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong..."} = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("listning port 8080");
});
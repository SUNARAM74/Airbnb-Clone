const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema.js');
const ExError = require('../utils/ExError.js');
const Listing = require('../models/listing.js');

// Listings Backend (Database) Error Handling Middleware ↓
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

// Index Route ↓
router.get("/", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// Create New Page Route ↓
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create Post Route ↓
router.post("/create",
 validateListing,
  wrapAsync ( async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!"); 
    res.redirect("/listings");
}));

// Show with Reviews Route ↓
router.get("/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error", "Listing Your Requested For Does Not Exist !");
        res.redirect("/listings") 
    }
    res.render("listings/show.ejs", { listing });
}));

// Edit Page Route ↓
router.get("/edit/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing Your Requested For Does Not Exist !");
        res.redirect("/listings") 
    }
    res.render("listings/edit.ejs", {listing});
}));

// Update Route ↓
router.put("/update/:id",
 validateListing,
  wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Updated Listing !"); 
    res.redirect(`/listings/${id}`);
}));

// Listing Delete Route ↓
router.delete("/fire/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted Listing !"); 
    res.redirect("/listings");
}));

module.exports = router;
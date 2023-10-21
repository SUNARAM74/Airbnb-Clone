const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// Index Route ↓
router.get("/", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// Create New Page Route ↓
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Create Post Route ↓
router.post("/create",
    isLoggedIn,
        validateListing,
            wrapAsync ( async (req, res) => {
                const newListing = new Listing(req.body.listing);
                newListing.owner = req.user._id; 
                await newListing.save();
                req.flash("success", "New Listing Created!"); 
                res.redirect("/listings");
}));

// Show with Reviews Route ↓
router.get("/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", 
            populate: { path: "author", },
        }).populate("owner");
    if(!listing) {
        req.flash("error", "Listing Your Requested For Does Not Exist !");
        res.redirect("/listings") 
    }
    res.render("listings/show.ejs", { listing });
}));

// Edit Page Route ↓
router.get("/edit/:id", isLoggedIn, isOwner, wrapAsync( async (req, res) => {
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
    isLoggedIn,
      isOwner,
        validateListing,
            wrapAsync( async (req, res) => {
                let { id } = req.params;
                await Listing.findByIdAndUpdate(id, {...req.body.listing});
                req.flash("success", "Updated Listing !"); 
                res.redirect(`/listings/${id}`);
}));

// Listing Delete Route ↓
router.delete("/fire/:id", isLoggedIn, isOwner,  wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted Listing !"); 
    res.redirect("/listings");
}));

module.exports = router;
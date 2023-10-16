const express = require('express');
const router = express.Router({ mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExError = require("../utils/ExError.js");
const { reviewSchema } = require('../schema.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');

// Reviews Backend (Database) Error Handling Middleware ↓
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

// Reviews Post Route ↓
router.post("/:id/reviews", 
 validateReview, 
  wrapAsync( async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added!"); 
    res.redirect(`/listings/${ listing.id }`);
}));

// Reviews Delete Route ↓
router.delete("/fire/:id/reviews/:reviewId", wrapAsync( async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate( id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete( reviewId );
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
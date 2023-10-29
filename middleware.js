const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const ExError = require('./utils/ExError.js');

// Redirect Url Save Middleware ↓ (routes -> user.js)
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
};

// Log in chacked Middleware ↓ (routes -> listing.js)
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.path, "...", req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "You must be logged in to create listing..!")
        return res.redirect("/login")
    }
    next();
};

// Owner chacked Middleware ↓ (routes -> listing.js)
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next()
};

// Listings Backend (Database) Error Handling Middleware ↓ (routes -> listing.js)
module.exports.validateListing = ((req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExError(400, errMsg);
    }
    else {
        next();
    }
});

// Reviews Backend (Database) Error Handling Middleware ↓ (routes -> review.js)
module.exports.validateReview = ((req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExError(400, errMsg);
    }
    else {
        next();
    }
});

// Review Owner chacked Middleware ↓ (routes -> review.js)
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next()
};
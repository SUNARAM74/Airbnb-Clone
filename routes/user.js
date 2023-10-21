const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

// Sign Up Page Route ↓
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
});

// Sign Up Post Create Route ↓
router.post("/signup", wrapAsync( async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username});
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if(err) {
                return next(err)
            }
            req.flash("success", "Well Come To Airbnb Clone");
            res.redirect("/listings");
        });
    }
    catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// Log In Page Route ↓
router.get("/login", (req, res) => {
    res.render("users/login.ejs")
});

// Log In Post Route ↓
router.post('/login',
saveRedirectUrl, 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash : true}), // Authenticate Middleware
    async (req, res) => {
        req.flash("success", "Wellcome Back Airbnb Clone!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl)
});

// Log Out Get Route ↓
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out.");
        res.redirect("/listings");
    });
});

module.exports = router;
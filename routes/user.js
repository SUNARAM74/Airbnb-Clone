const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
});

router.post("/signup", wrapAsync( async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username});
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.flash("success", "Well Come To Airbnb Clone");
        res.redirect("/listings");
    }
    catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs")
});

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash : true}), // Authenticate Middleware
    async (req, res) => {
        req.flash("success", "Wellcome Back Airbnb Clone!");
        res.redirect("/listings")
});

module.exports = router;
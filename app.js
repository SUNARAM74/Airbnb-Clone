const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExError = require("./utils/ExError.js");
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');
const session = require('express-session');
const flash = require('connect-flash');

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
app.use(express.urlencoded({extended: true}));     // urlencoded middleware
app.use(methodOverride('_method'));                // method-override middleware
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', engine);

// Session MiddleWare Define ↓
const sessionOption = {
    secret: 'this is a secret ..!', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
    },
};

// Root Route ↓
app.get("/", (req, res) => {
    res.send("Hi, I Am Root 🙏");
});

// Session, Connect-flash Middlewere ↓
app.use(session( sessionOption ));
app.use(flash());

// Connect-flash Define Middlewere ↓
app.use((req, res, next) => {
    res.locals.errorMsg = req.flash("error");
    res.locals.successMsg = req.flash("success");
    next();
});

// Router Middle Ware ↓
app.use("/listings", listings);
app.use("/listings", reviews);

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
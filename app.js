const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExError = require("./utils/ExError.js");
const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');


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

// Passport Middleware ↓
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect-flash Define Middlewere ↓
app.use((req, res, next) => {
    res.locals.errorMsg = req.flash("error");
    res.locals.successMsg = req.flash("success");
    next();
});

// Demo Register
// app.get("/demouser", async(req, res) => {
//     let fuser = new User ({
//         email: "suna@gmail.ocm",
//         username: "sunax"
//     });
//     let regUser = await User.register(fuser, "helloworld");
//     res.send(regUser);
// });

// Router Middle Ware ↓
app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/", userRouter);

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
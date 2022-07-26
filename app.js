if(process.env.NODE_ENV !=="production"){
  require('dotenv').config()
}

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const engine = require("ejs-mate");
const _ = require('lodash');
app.locals._ = _;
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const User = require("./models/user")
const port = process.env.PORT || 3000;




const userRoutes = require("./routes/user");
const picnicspotRoutes = require("./routes/picnicspots");
const reviewRoutes = require("./routes/reviews");

const db_url = process.env.DB_URL || "mongodb://localhost:27017/pik-nip";
mongoose.connect(db_url);
// mongoose.connect(dbUrl);



app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public")));
app.use(methodOverride("_method"));
app.use(mongoSanitize());
// app.use(helmet());


const secret = process.env.secret || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: db_url,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash())


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






app.use((req, res, next)=>{
  if(!["/login","/register", "/"].includes(req.originalUrl)){
    req.session.returnTo = req.originalUrl
  }
  console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dzmbgzot8/"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dzmbgzot8/"
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dzmbgzot8/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dzmbgzot8/" ];

app.use(
  helmet({
      contentSecurityPolicy: {
          directives : {
              defaultSrc : [],
              connectSrc : [ "'self'", ...connectSrcUrls ],
              scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
              styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
              workerSrc  : [ "'self'", "blob:" ],
              objectSrc  : [],
              imgSrc     : [
                  "'self'",
                  "blob:",
                  "data:",
                  "https://res.cloudinary.com/dzmbgzot8/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                  "https://images.unsplash.com/"
              ],
              fontSrc    : [ "'self'", ...fontSrcUrls ],
              mediaSrc   : [ "https://res.cloudinary.com/dlzez5yga/" ],
              childSrc   : [ "blob:" ]
          }
      },
      crossOriginEmbedderPolicy: false
  })
);



app.use("/", userRoutes);
app.use("/picnicspots", picnicspotRoutes);
app.use("/picnicspots/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
  // console.log(PicnicSpot);
});


app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!!", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong! ";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

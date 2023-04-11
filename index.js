if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


const express = require("express");
const mongoose = require(`mongoose`);
const app = express();
const path = require(`path`);
const methodOverride = require(`method-override`);
const ejsMate = require(`ejs-mate`);
const morgan = require(`morgan`);
const ExpressError = require(`./utils/ExpressError`);
//Routes
const campgroundRoutes = require(`./routes/campgrounds`);
const reviewRoutes = require(`./routes/reviews`);
const userRoutes = require('./routes/users')
//
const session = require(`express-session`);
const flash = require(`connect-flash`);
const passport = require(`passport`);
const LocalStrategy = require(`passport-local`)
const User = require(`./models/user`);
const helmet = require(`helmet`);
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require(`./utils/helmetConfig`);

//Mongo Sanitize to prevent mongo injection attacks
const mongoSanitize = require(`express-mongo-sanitize`);

//Mongo Atlas
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp"

//For secret
const secret = process.env.SECRET || "thisismysecret"

//For Storing Sessions in Mongo
const MongoStore = require('connect-mongo')
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret
  }
});

store.on("error", function (error) {
  console.log(`Session Store Error: ${error}`);
})



app.set(`view engine`, `ejs`);
app.set(`views`, path.join(__dirname, `/views`));

//Mongoose Init
mongoose
  //The end of the .connect url is the name of the DB, so in this instance its 'yelp-camp'
  .connect(dbUrl)
  .then(() => {
    console.log("Mongoose Connection Successful");
  })
  .catch((err) => {
    console.log("Error On Opening Mongoose Connection: " + err);
  });

//Middle Ware;
app.use(morgan(`dev`));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(`_method`));
app.engine(`ejs`, ejsMate);
app.use(express.static(path.join(__dirname, `/public`)));
app.use(flash())
//Mongose Sanitize
app.use(mongoSanitize());
//Helmet Config


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/deosogcvp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/"
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        mediaSrc: ["https://res.cloudinary.com/dlzez5yga/"],
        childSrc: ["blob:"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

//Express Session
const sessionConfig = {
  //Session Store
  store: store,
  //Custom name for security
  name: `session`,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //For extra security
    httpOnly: true,
    //Cookies will only work over HTTPS, but localhost is not over HTTPS so it will break thinga
    // secure: true,
    //Dates are in milliseconds, our sessions will expire after a week
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }

}

//Use Express Session
app.use(session(sessionConfig))

//Passport init AFTER app.use session
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//Flash Middleware For Styles
app.use((req, res, next) => {
  //Express locals for all tempaltes
  res.locals.success = req.flash(`success`);
  res.locals.error = req.flash(`error`);
  //Singed in user using passport, we have access to the user object in all templates
  res.locals.currentUser = req.user;
  next()
});


/*
Routes, for reviews both start with /campgrounds/:id/reviews which will make us do some changes since in the routes we dont have access to the campground id,
we fix this with mergeParams: true in the router init
*/
app.use(`/campgrounds/:id/reviews`, reviewRoutes)
app.use(`/campgrounds`, campgroundRoutes);
app.use(`/`, userRoutes);



//Home Page
app.get("/", async (req, res) => {
  res.render(`home`);
});



//404

app.all(`* `, (req, res, next) => {
  next(new ExpressError(`Page Not Found`, 404));
})

//Catching All Errors And Error page
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = `Something Went Wrong`
  res.status(statusCode).render(`error`, { err })
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});



const Campground = require(`./models/campground`);
const ExpressError = require("./utils/ExpressError");
//Schema for JOI
const { campgroundSchema, reviewSchema } = require(`./schemas.js`)
//Mongoose models
const Review = require(`./models/review`);

module.exports.isLoggedIn = (req, res, next) => {
    //req.user is given by Passport
    // console.log(`Reqeust user: ${req.user}`);
    if (!req.isAuthenticated()) {
        //Store URL user is requesting so you can redirect back to it when they login so they dont have to go all the way back to where they were
        req.session.returnTo = req.originalUrl;
        //Flash login error
        req.flash(`error`, `You need to be logged in to do that`);
        return res.redirect(`/login`);
    }
    //Else if authentication is successful go to the next middleware
    next()
}

//Validate campground middleware
module.exports.validateCampground = (req, res, next) => {
    //Joi Schema
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        //Mapping over errors
        const msg = error.details.map(el => el.message).join(`\n`);
        throw new ExpressError(msg, 400)
    } else {
        //No Error, Go Next
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    //Authorization
    if (!campground.author.equals(req.user._id)) {
        req.flash(`error`, `You are not authorized to alter this campground`);
        return res.redirect(`/campgrounds/${id}`);
    }
    //No error, Go Next
    next();
}

//Validate review Middleware
module.exports.validateReview = (req, res, next) => {
    //Validate review
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        //Mapping over errors
        const msg = error.details.map(el => el.message).join(`\n`);
        //Show error message
        throw new ExpressError(msg, 400)
    } else {
        //No Error, Go Next
        next()
    }

}

//Is review author middleware
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    //Authorization
    console.log(review);
    //equals since == does not work with Mongoose objectId
    if (!review.author.equals(req.user._id)) {
        req.flash(`error`, `You are not authorized to alter this review`);
        return res.redirect(`/campgrounds/${id}`);
    }
    //No error, Go Next
    next();
}

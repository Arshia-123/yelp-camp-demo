const express = require("express");
//Merge params gives us access to other params from main router init
const router = express.Router({ mergeParams: true });

//Express Error Utils
const catchAsync = require(`../utils/catchAsync`);

//Models (From Mongo)
const Campground = require(`../models/campground`);
const Review = require(`../models/review`);

//Middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require(`../middleware`);

//Controllers
const reviews = require(`../controllers/reviews`);




//Review
router.post("/", isLoggedIn, validateReview, catchAsync(
    reviews.createReview
));

//Delete review
router.delete(`/:reviewId`, isLoggedIn, isReviewAuthor, catchAsync(
    reviews.deleteReview
))








module.exports = router;



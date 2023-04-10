//Mongoose Models
const Campground = require(`../models/campground`);
const Review = require(`../models/review`);

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("author");;
    //review is an object with rating and body
    const review = new Review(req.body.review);
    //Set review author to current signed in user Id
    review.author = req.user._id;
    //Prevent users from adding a review to their own camps, when comparing mongoose id's we must use .equals() instead of ==
    if (req.user._id.equals(campground.author._id)) {
        req.flash(`error`, `Cannot add a review to your own campground!`);
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    //Push to campground model, one-to-many parent-to-child relationship
    campground.reviews.push(review);
    //save both
    await review.save()
    await campground.save()
    req.flash(`success`, `Created new review`);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    //Review ID and Camp ID is in the route
    const { id, reviewId } = req.params
    //Pull from review array the review ID
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash(`success`, `Successfully deleted review`);
    res.redirect(`/campgrounds/${id}`);
}
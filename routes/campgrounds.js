const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require(`../utils/catchAsync`);
const Campground = require(`../models/campground`);
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//For cloudinary
//Node auto looks for index.js in the root folder so no ned to specify cloudinary/index
const { storage } = require("../cloudinary");

//Multer for processing form images, it is a middleware
const multer = require("multer");
//set multer to cloudinary storage
const upload = multer({ storage })

// Controllers init
const campgrounds = require(`../controllers/campgrounds`);

router.route("/")
    .get(catchAsync(campgrounds.index))
    //image is the name of the field on the form, so for us the input has a name `image`
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


//For Creation Form ORDER MATTERS, SO ABOVE THE :id routes
router.get("/new", isLoggedIn,
    campgrounds.renderNewForm
);

//Viewing, Deleting and Updating
router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));





//Editing
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(
    campgrounds.renderEditForm
));










module.exports = router;
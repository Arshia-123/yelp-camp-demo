const Campground = require(`../models/campground`);

const { cloudinary } = require(`../cloudinary`);

//Mapbox Geocoding Setup
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })



//All Controllers


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render(`campgrounds/index`, { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    //is Logged In is auth middleware using passport
    res.render(`campgrounds/new`);

}

module.exports.createCampground = async (req, res, next) => {

    //Mapbox geodata init to get the lat and lng for the coordinates of the given location
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    //Make a new campground
    const campground = new Campground(req.body.campground);
    //Save GeoJson
    campground.geometry = geoData.body.features[0].geometry
    //Map over all files given by User and create an array of objects with name and url and save to campground images
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //Set author to user ID to associate campgrounds with a user
    campground.author = req.user._id;
    await campground.save();
    //Flash for campground success
    req.flash(`success`, `Successfully added a new campground`);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    //Fetch campground by ID and give it to template
    const campgroundID = req.params.id;
    //Populate reviews and author so we have full access to them, we nest populate reviews and their associated author. the last .populate() is for the author of the CAMP not REVIEW
    const campground = await Campground.findById(campgroundID).populate(
        { path: `reviews`, populate: { path: 'author' } }
    ).populate('author');
    if (!campground) {
        req.flash(`error`, `Campground not found`);
        //Return prevents further code execution
        return res.redirect(`/campgrounds`);
    }
    res.render(`campgrounds/show`, { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campgroundID = req.params.id;
    const campground = await Campground.findById(campgroundID);
    if (!campground) {
        req.flash(`error`, `Campground not found`);
        //Return prevents further code execution
        return res.redirect(`/campgrounds`);
    }
    res.render(`campgrounds/edit`, { campground });
}

module.exports.updateCampground = async (req, res) => {
    const campgroundID = req.params.id; // You can also {id} = req.param
    //Find by id an update the given campground handing all the parameters in a destructured object
    const campground = await Campground.findByIdAndUpdate(campgroundID, { ...req.body.campground });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //Map over all files and create an array of objects with name and url and save to campground images
    //Spread images so insead of psuhing a entire array, we only have objects of images
    campground.images.push(...images);
    //Save new editted
    await campground.save()
    //Deleting images
    if (req.body.deleteImages) {
        //Delte from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        //And
        //Pull from images array the images where the filename is in the req.body.deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash(`success`, `Successfully updated campground`);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const campgroundID = req.params.id;
    //Fetch camp Name to display to user
    const { title } = await Campground.findById(campgroundID);
    await Campground.findByIdAndDelete(campgroundID);
    req.flash(`success`, `Successfully deleted ${title}`);
    res.redirect(`/campgrounds`);
}
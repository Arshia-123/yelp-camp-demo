const mongoose = require(`mongoose`);
//Shortcut
const Schema = mongoose.Schema;
const Review = require(`./review`);

//Async library
const async = require(`async`);

//Seperate Schema for images
const imageSchema = new Schema({
  url: String,
  filename: String
})

//We can access this using image.thunbmail snince thats the name of the virtual

//Virtual for each image to allow us to add the cloudinary url params to customize the image
imageSchema.virtual(`thumbnail`).get(function () {
  //this refers to the current document

  //add the cloudinary url params
  return this.url.replace("/upload", "/upload/w_200");
})

//TO inclue Virtuals as JSON
const opts = { toJSON: { virtuals: true } };


const CampgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  //Geometry for GeoJson, This is the Schema for the GeoJson
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  //One Two Many Relationship Parent to Child
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  //One Two Many Relationship Parent to Child
  reviews: [
    {
      type: Schema.Types.ObjectId,
      // Ref is the Review model
      ref: `Review`
    }
  ]
  //Opts for Options including virtuals as JSON
}, opts);

//Virtual for MapBox popup, a virtual is just like a added method to the model. We can access this virtual by campground.properties.popUpMarkup and the markut will be a custom string
CampgroundSchema.virtual(`properties.popUpMarkup`).get(function () {
  //this refers to the current document


  //Calculate average review score for each Campground


  //There is an issue with this https://stackoverflow.com/questions/75970506/array-push-not-working-with-mongoose-populate
  //Empty array will be populated with all scores
  // const allReviewsRating = []
  // this.populate("reviews").then(async function (allReviews) {
  //   allReviewsRating.push(`1`)
  //   for (const review of allReviews.reviews) {
  //     allReviewsRating.push(review.rating)

  //   }
  //   // async.map(review, allReviews.reviews)

  // })



  //allReviewsRating.reduce((p, c, _, a) => p + c / a.length, 0) || `No Reviews For This Campground`



  //add custom properties of Campgrond to display as Mapbox Popup
  return `<h3>${this.title}</h3><h5>${this.location}</h5><p>${this.description}</p><a href=/campgrounds/${this._id}>Go To This Camp</a>`;
})


//Delete reviews associated with campground after campground has been deleted

//Post so after the thing is deleted
CampgroundSchema.post(`findOneAndDelete`, async function (doc) {
  if (doc) {
    //Delete associated reviews which were embedded in the campground

    //Remove the reviews which`s ID`s are in the doc.reviews array
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model(`Campground`, CampgroundSchema);

const Campground = require(`../models/campground`);
const mongoose = require(`mongoose`);
const { places, descriptors } = require(`./seedHelpers`);
const cities = require(`./cities`);
//Mongoose Init
mongoose.connect(`mongodb://127.0.0.1:27017/yelp-camp`);

const db = mongoose.connection;
db.on(`error`, console.error.bind(console, "Connection Error: "));
db.once("open", () => {
  console.log(`Mongoose Database Connected`);
});

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDB() {
  //Remove all
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //YOUR USER ID
      author: '642dc09d31cd33421acb1e74',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      images: [
        {
          "url": "https://res.cloudinary.com/deosogcvp/image/upload/v1680873608/YelpCamp/c3hicggaxul15omshxbs.jpg",
          "filename": "YelpCamp/c3hicggaxul15omshxbs",
        },
        {
          "url": "https://res.cloudinary.com/deosogcvp/image/upload/v1680873607/YelpCamp/jffflco42pvvze1xkuwc.jpg",
          "filename": "YelpCamp/jffflco42pvvze1xkuwc",
        }
      ],
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae quo nulla, rem exercitationem pariatur dignissimos dolor obcaecati a quas quidem laborum odio, ut delectus, accusantium tenetur doloremque sequi? Unde, illo`,
      price: price, // Can also just do price without price:price
      //Set default geometry
      geometry: {
        type: "Point",
        //For custom GeoJSON coordinates based on the random city we get
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
    });
    await camp.save();
  }
}

seedDB().then(() => {
  console.log(`Seeded Database`);
  mongoose.connection.close();
});

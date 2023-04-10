// Using EJS to access process.env 


//mapToken is set in the EJS File
mapboxgl.accessToken = mapToken

//Parse given campground data from ejs file
const campgroundParsed = JSON.parse(campground)
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    //GeoJson is set in the EJS File using whats given us from the controller, we pass in entire campground 
    center: campgroundParsed.geometry.coordinates, // starting position [lng, lat]
    zoom: 4, // starting zoom
});

//For Mapbox Controls Like Zoom in and Out
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Create a default Marker and add it to the map.
new mapboxgl.Marker()
    //GeoJson is set in the EJS File using whats given us from the controller, we pass in entire campground 
    .setLngLat(campgroundParsed.geometry.coordinates)
    //Set custom popup
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3>${campgroundParsed.title}</h3><p>${campgroundParsed.location}</p>`))
    .addTo(map);


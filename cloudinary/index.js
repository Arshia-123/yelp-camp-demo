const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//Config cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        //Folder in cloudinary to store images
        folder: `YelpCamp`,
        allowedFormats: ['jpg', 'jpeg', 'png']
    }
})

module.exports = {
    cloudinary,
    storage
}
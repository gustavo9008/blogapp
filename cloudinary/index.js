const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'BlogApp',
        allowedFormats: ['jpeg', 'png', 'jpg', 'JPG', 'webp']
    }
});
const postStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'postBlogAppImages',
        allowedFormats: ['jpeg', 'png', 'jpg', 'JPG', 'webp']
    }
});

module.exports = {
    cloudinary,
    storage,
    postStorage
}
const Imagekit = require('imagekit');
require('dotenv').config()

module.exports = new Imagekit(
    {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}`
    }
)
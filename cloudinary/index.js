const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  const storage1 = new CloudinaryStorage({
    cloudinary,
    params: {
    folder: "Piknip",
    allowedFormats: ["jpeg", "png", "jpg"],
    },
  })

  const storage2 = new CloudinaryStorage({
    cloudinary,
    params:{
      folder: "Piknip/UserAvatar",
      allowedFormats: ["jpeg", "png", "jpg"],
    }
  })


module.exports ={
    cloudinary,
    storage1,
    storage2
  } 
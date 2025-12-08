// import multer from "multer";
// import cloudinary from "@/config/cloudinary.config";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import path from "path";

// const profileImageStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const phone = req.body.phone;
//     return {
//       folder: `seat-based-ridesharing-platform/profile-images/${phone}`,
//       allowed_formats: ["jpg", "jpeg", "png", "webp"],
//       transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
//     };
//   },
// });

// const carImagesStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const phone = req.body.phone;
//     return {
//       folder: `seat-based-ridesharing-platform/car-images/${phone}`,
//       allowed_formats: ["jpg", "jpeg", "png", "webp"],
//       transformation: [{ width: 800, height: 600, crop: "fill" }],
//     };
//   },
// });

// const imageFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|webp/;
//   const extname = allowed.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowed.test(file.mimetype);
//   if (mimetype && extname) return cb(null, true);
//   cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
// };

// export const profileImageUpload = multer({
//   storage: profileImageStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: imageFileFilter,
// });

// export const carImagesUpload = multer({
//   storage: carImagesStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: imageFileFilter,
// });


import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config";
import path from "path";

const registrationUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const phone = req.body?.phone || "default";
      const folder = file.fieldname === 'profileImage' 
        ? `seat-based-ridesharing-platform/profile-images/${phone}`
        : `seat-based-ridesharing-platform/car-images/${phone}`;
      
      const transformation = file.fieldname === 'profileImage'
        ? [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
        : [{ width: 800, height: 600, crop: "limit" }];
      
      return {
        folder,
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation,
      };
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
  },
});


export {registrationUpload}
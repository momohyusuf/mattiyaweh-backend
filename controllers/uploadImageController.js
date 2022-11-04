const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadImage = async (req, res) => {
  console.log(req.files);
  const profilePicture = req.files.profilePicture;

  const imageMaxSize = 5000000;

  if (!profilePicture) {
    throw new CustomError.BadRequestError("Please upload a file");
  }

  if (!profilePicture.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Image file only");
  }

  if (profilePicture.size > imageMaxSize) {
    throw new CustomError.BadRequestError("Image cannot be greater than 5mb");
  }
  const result = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
    use_filename: true,
    folder: "mattiyaweh users",
  });

  fs.unlinkSync(profilePicture.tempFilePath);
  return res
    .status(StatusCodes.CREATED)
    .json({ image: result.secure_url, public_id: result.public_id });
};

// +++++++++++++++++++++++++++
// ++++++++++++++++++++++++++

// upload item images
const uploadItemImage = async (req, res) => {
  const itemPicture = req.files.itemPicture;
  const imageMaxSize = 5000000;

  if (!itemPicture) {
    throw new CustomError.BadRequestError("Please upload a file");
  }

  if (!itemPicture.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Image file only");
  }

  if (itemPicture.size > imageMaxSize) {
    throw new CustomError.BadRequestError("Image cannot be greater than 5mb");
  }
  const result = await cloudinary.uploader.upload(itemPicture.tempFilePath, {
    use_filename: true,
    folder: "mattiyaweh items",
  });

  fs.unlinkSync(itemPicture.tempFilePath);

  return res
    .status(StatusCodes.CREATED)
    .json({ image: result.secure_url, public_id: result.public_id });
};

module.exports = {
  uploadItemImage,
  uploadImage,
};

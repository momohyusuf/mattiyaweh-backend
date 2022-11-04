const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Item = require("../models/itemModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;

const createItem = async (req, res) => {
  const {
    itemDescription,
    itemPictureOne,
    itemPictureTwo,
    state,
    pickUpSpot,
    phoneNumber,
  } = req.body;
  if (!itemDescription || !pickUpSpot || !phoneNumber) {
    throw new CustomError.BadRequestError("Please provide the required values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const { firstName, lastName, profilePicture } = user;

  req.user = user._id;
  const itemInformation = {
    itemDescription,
    pickUpSpot,
    createdBy: `${firstName} ${lastName}`,
    userImage: profilePicture.image,
    itemPictureOne,
    itemPictureTwo,
    state,
    user: user._id,
    phoneNumber,
  };
  const item = await Item.create(itemInformation);

  res.status(StatusCodes.CREATED).json({ message: "Item Posted" });
};
// ++++++++++++++++++++++++++
// ++++++++++++++++++++++++++
const getAllItems = async (req, res) => {
  const { state, searchValue } = req.query;
  let queryObject = {};

  if (searchValue) {
    queryObject.itemDescription = { $regex: searchValue, $options: "i" };
  }

  if (state) {
    queryObject.state = state;
  }
  let result = Item.find(queryObject)
    .select("-pickUpSpot -phoneNumber")
    .sort("-updatedAt");

  // for pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;

  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const items = await result;

  let totalItems = await Item.countDocuments(queryObject);
  let numberOfPages = Math.ceil(totalItems / limit);
  // +++++++++++++++++++++
  // +++++++++++++++

  res.status(StatusCodes.OK).json({ items, totalItems, numberOfPages });
};
// +++++++++++++++++++++++++++
// ++++++++++++++++++++++++++xcg
const getSpecificUserItems = async (req, res) => {
  const userId = req.user.userId;
  const items = await Item.find({ user: userId });
  res.status(StatusCodes.OK).json({ items });
};
// +++++++++++++++++++++++++
// ++++++++++++++++++++++++++
const getSingleItem = async (req, res) => {
  const itemId = req.params.id;
  const item = await Item.findOne({ _id: itemId });

  res.status(StatusCodes.OK).json({ item });
};
// +++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++
const updateItem = async (req, res) => {
  res.send("update item route");
};
// ++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++
const deleteItem = async (req, res) => {
  const itemId = req.params.id;

  const item = await Item.findOne({ _id: itemId });

  if (item.itemPictureOne.public_id) {
    await cloudinary.uploader.destroy(item.itemPictureOne.public_id);
  }
  if (item.itemPictureTwo.public_id) {
    await cloudinary.uploader.destroy(item.itemPictureTwo.public_id);
  }

  await item.delete();
  res.status(StatusCodes.OK).json({ message: "Item Deleted" });
};

module.exports = {
  createItem,
  getAllItems,
  getSpecificUserItems,
  getSingleItem,
  updateItem,
  deleteItem,
};

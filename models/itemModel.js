const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
  {
    itemDescription: {
      type: String,
      required: [true, "Item Description is required"],
      minLength: 5,
    },
    pickUpSpot: {
      type: String,
      required: [true, "Please enter pick up Location"],
    },
    phoneNumber: {
      type: String,
    },
    itemPictureOne: {
      image: {
        type: String,
      },
      public_id: "",
    },

    itemPictureTwo: {
      image: {
        type: String,
      },
      public_id: "",
    },
    userImage: {
      type: String,
    },
    state: {
      type: String,
      required: [true, "please a state is required"],
      enum: {
        values: [
          "Abia",
          "Adamawa",
          "Akwa Ibom",
          "Anambra",
          "Bauchi",
          "Bayelsa",
          "Benue",
          "Bayelsa",
          "Borno",
          "Cross River",
          "Delta",
          "Ebonyi",
          "Edo",
          "Ekiti",
          "Enugu",
          "Gombe",
          "Imo",
          "Jigawa",
          "Kaduna",
          "Kano",
          "Kastina",
          "Kebbi",
          "Kogi",
          "Kwara",
          "Lagos",
          "Nasarawa",
          "Niger",
          "Ogun",
          "Ondo",
          "Osun",
          "Oyo",
          "Plateau",
          "Rivers",
          "Sokoto",
          "Taraba",
          "Yobe",
          "Zamfara",
          "Federal Capital Territory",
        ],
        message: "{VALUE} is not a state located in Nigeria",
      },
    },
    createdBy: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Item", ItemSchema);

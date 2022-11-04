const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "please enter your first name"],
      trim: true,
      min: 2,
    },
    lastName: {
      type: String,
      required: [true, "please enter your last name"],
      trim: true,
      min: 2,
    },
    profilePicture: {
      image: {
        type: String,
        default:
          "https://th.bing.com/th/id/OIP.1LRUIB2OXVePxD5hQm4fqwHaHa?pid=ImgDet&rs=1",
      },
      public_id: { type: String },
    },

    email: {
      type: String,
      unique: true,
      validate: {
        validator: /^(?!\.)[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        message: "please enter a valid email address",
      },
      required: [true, "please enter your email address"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "please enter your phone number"],
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
    city: {
      type: String,
      required: [true, "please enter your city"],
    },
    verificationToken: {
      type: String,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Date,
    },
    password: {
      type: String,
      validate: {
        validator:
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/,
        message:
          "password should contain at least one special character, one digit, one Uppercase letter, minimum of length of six characters",
      },
      required: [true, "please create a password"],
    },
    acceptedAgreement: {
      type: Boolean,
      required: [true, "please your have to accept out terms of agreement"],
      default: false,
    },

    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = new mongoose.model("User", UserSchema);

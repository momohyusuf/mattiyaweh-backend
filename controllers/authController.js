const { StatusCodes } = require("http-status-codes");
// models used for auth purposes
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
// =======================
const CustomError = require("../errors");
const sendEmailVerification = require("../utils/sendEmailVerification");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const attachCookiesToResponse = require("../utils/attachCookiesToResponse");
const sendResetPasswordEmail = require("../utils/sendPasswordReset");

// register User controller
const registerUser = async (req, res) => {
  // check if an account already exist with the user email address
  const emailAlreadyRegistered = await User.findOne({
    email: req.body.email,
  });

  if (emailAlreadyRegistered) {
    throw new CustomError.BadRequestError(
      `An account with ${req.body.email} already exist`
    );
  }
  // ===================================

  // if an account does'nt already exist, create a new one.
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const createUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    state: req.body.state,
    city: req.body.city,
    profilePicture: req.body.profilePicture,
    password: req.body.password,
    acceptedAgreement: req.body.acceptedAgreement,
    verificationToken,
  };

  const user = await User.create(createUser);

  const { email, firstName } = user;

  const origin = req.get("origin");
  // message to be sent as the body of the mail
  const message = `
  <h3>Dear ${firstName}.</h3>
  <p>Thank you for choosing Mattiyaweh you're one step away from becoming you brother's keeper. Please follow the link to verify your account <a href=${origin}/user/verify-email?token=${verificationToken}&email=${email}>Confirm Email</a> </p>`;
  // send verification email to the user's email address
  await sendEmailVerification({
    userEmail: email,
    subject: "Email Verification",
    html: message,
  });
  // =================================

  res.status(StatusCodes.OK).json({
    message:
      "Thank you for signing up. Please check your email to verify your account.",
  });
};
// +++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++
// verifying user email address
const verifyEmailAddress = async (req, res) => {
  const { verificationToken, email } = req.body;

  // check if the email and token is provided
  if (!verificationToken || !email) {
    throw new CustomError.BadRequestError("Invalid Credentials");
  }
  // =====================
  // find the user that has the email address to verify that the account actually exist
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnAuthenticatedError("Invalid Credentials");
  }
  // =====================

  // check if the token provided is correct
  if (verificationToken !== user.verificationToken) {
    throw new CustomError.UnAuthenticatedError("Invalid Credentials");
  }
  // ====================

  // verify the account only once
  user.accountVerified = true;
  user.verificationToken = "";
  user.verified = Date.now();
  // ======================
  await user.save();

  res.status(StatusCodes.OK).json({
    message: "Account Successfully Verified please proceed to log in",
  });
};
// +++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // check the email and password is provided
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide your email and password"
    );
  }
  // =================================
  // check if the user exist
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.BadRequestError(`No user found with ${email} `);
  }
  // =================================
  // compare the password against the hashed password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnAuthenticatedError("Incorrect password");
  }
  // =================================
  // check if the user has verified their account
  if (!user.accountVerified) {
    throw new CustomError.UnAuthenticatedError(
      "Please verify your account to log in"
    );
  }
  // ==================================

  // user information to be sent to frontend
  const userInfo = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: {
      image: user.profilePicture.image,
      public_id: user.profilePicture.public_id,
    },
    state: user.state,
    city: user.city,
    phoneNumber: user.phoneNumber,
  };
  // ===========================
  // create a refresh token
  let refreshToken = "";
  // ============================

  // check for existing user token;
  const existingToken = await Token.findOne({ user: user._id });

  // check if the user already have an existing token, then send back the the user cookie
  if (existingToken) {
    // check if the user account is blocked
    const { accountBlocked } = existingToken;
    if (accountBlocked) {
      throw new CustomError.UnAuthorizedError(
        "Your Account has been blocked for violation"
      );
    }
    // ===================

    // if the account is not blocked send back the cookies
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse(res, user, refreshToken);
    res.status(StatusCodes.OK).json({ userInfo });
    return;
    // ================================
  }

  //if the user is logging for the firstTime, create a token for the user  for future verification login
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;
  const userToken = { refreshToken, ipAddress, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse(res, user, refreshToken);
  res.status(StatusCodes.OK).json({ userInfo });
  // ===============================================
};
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// logout user function

const logoutUser = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  // reset the cookies empty values
  res.cookie("accessToken", " ", {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
  });
  res.cookie("refreshToken", " ", {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: "none",
  });

  res.status(StatusCodes.OK).json({ message: "logout successful" });
};
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// send forget password link
const forgetPassword = async (req, res) => {
  console.log(req.body);
  // check if an email is provided
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide your email");
  }
  // ==========================
  // find the user
  const user = await User.findOne({ email });
  // password link duration time
  const fiveMinutes = 1000 * 60 * 5;
  // ==========================

  const passwordToken = crypto.randomBytes(40).toString("hex");
  // send the password reset link
  const origin = req.get("origin");
  const message = `<p>Please follow the link to reset your password. Link expires in 5 minutes  <a href=${origin}/user/reset-password?token=${passwordToken}&email=${email}>Reset Password</a> </p>`;
  await sendResetPasswordEmail({
    userEmail: email,
    subject: "Password Reset",
    html: message,
  });
  console.log(user.passwordToken);
  const passwordTokenExpirationDate = new Date(Date.now() + fiveMinutes);
  user.passwordToken = passwordToken;
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;

  await user.save();

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Password reset link sent to your email" });
};
// ++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++

// Reset Password

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide password, email, and token"
    );
  }

  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();
    if (user.passwordTokenExpirationDate < currentDate) {
      throw new CustomError.UnAuthenticatedError(
        "password link already expired"
      );
    }
    if (
      token === user.passwordToken &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    } else {
      res.status(500).json({ message: "error occured" });
    }
  }

  res
    .status(StatusCodes.CREATED)
    .json({ message: `Password Reset successful` });
};

// +++++++++++++++++++++++
// ++++++++++++++++++++++++

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ userInfo: req.user });
};
module.exports = {
  registerUser,
  verifyEmailAddress,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  showCurrentUser,
};

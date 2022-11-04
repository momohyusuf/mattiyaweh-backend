const jwt = require("jsonwebtoken");

// create your payload object i.e the information to converted to a token
const createJWTPayload = (user) => {
  return {
    firstName: user.firstName,
    profilePicture: user.profilePicture,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    state: user.state,
    city: user.city,
    userId: user._id,
  };
};
// ========================

// create the jason web token
const createJasonWebToken = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};
// ===============================

// attach the cookies to the response you're sending back for verification
const attachCookiesToResponse = (res, user, refreshToken) => {
  // create the cookies you want
  const accessToken = createJasonWebToken({
    payload: { user: createJWTPayload(user) },
  });
  const refreshTokenJWT = createJasonWebToken({
    payload: { user: createJWTPayload(user), refreshToken },
  });
  // =====================================

  // cookie duration
  const oneDay = 1000 * 60 * 60 * 24; //one day
  const longerTokenDuration = 30 * 86400000; //30 days
  // ====================
  //   send the cookie to the user
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerTokenDuration),
  });
  //   =========================================
};

module.exports = attachCookiesToResponse;

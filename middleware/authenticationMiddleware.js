const CustomError = require("../errors");
const isTokenValid = require("../utils/verifyUserToken");
const Token = require("../models/tokenModel");
const attachCookiesToResponse = require("../utils/attachCookiesToResponse");

const authenticateUser = async (req, res, next) => {
  // get the access token and the refresh token from the body. the reason for **req.signedCookies** is because the cookies are signed with our JWT_Secret
  const { accessToken, refreshToken } = req.signedCookies;

  // very th tokens
  try {
    // before you give user access to specific routes, check if the user is authenticated
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    // =======================================

    // if the user already have a refresh token I.e if the user does'nt log out. just log the user in automatically
    const payload = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.accountBlocked) {
      throw new CustomError.UnAuthenticatedError("Authentication invalid");
    }
    const user = payload.user;
    const refreshToken = existingToken.refreshToken;
    attachCookiesToResponse(res, user, refreshToken);
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnAuthenticatedError("Authentication Invalid");
  }
};

module.exports = authenticateUser;

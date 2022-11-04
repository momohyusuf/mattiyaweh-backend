const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  // create an object to return default error code and message

  let customError = {
    message: err.message || "Sorry something went wrong try again later",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };
  // ++++++++++++++++++++++++++++
  // ++++++++++++++++++++++++++++++

  // create logic to handle possible error that the database might throw
  //   for sever input validations error
  if (err.name === "ValidationError") {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  // ======================================
  //when a user try to create a new information that already exist on the database with unique value that is only allowed to be used once
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )}. Please choose another value `;
    customError.statusCode = 400;
  }
  // ========================================
  // when a user tries to access an item that does'nt exist on the data base
  if (err.name === "CastError") {
    customError.message = `Not item found for id ${err.value}`;
    customError.statusCode = 404;
  }
  //   =======================================
  // +++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++

  return res
    .status(customError.statusCode)
    .json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;

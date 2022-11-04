const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyEmailAddress,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  showCurrentUser,
} = require("../controllers/authController");
const authenticateUser = require("../middleware/authenticationMiddleware");

router.post("/register", registerUser);
router.post("/verify-email", verifyEmailAddress);
router.post("/login", loginUser);
router.delete("/logout", logoutUser);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.get("/show-user", authenticateUser, showCurrentUser);

module.exports = router;

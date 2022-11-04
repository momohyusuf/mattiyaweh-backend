const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticationMiddleware");

const {
  createItem,
  getAllItems,
  getSpecificUserItems,
  getSingleItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

router.post("/create-item", authenticateUser, createItem);
router.get("/", getAllItems);
router.get("/user-items", authenticateUser, getSpecificUserItems);
router.get("/:id", authenticateUser, getSingleItem);
router.patch("/:id", authenticateUser, updateItem);
router.delete("/:id", authenticateUser, deleteItem);

module.exports = router;

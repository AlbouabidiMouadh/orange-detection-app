const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/delete", authMiddleware, deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

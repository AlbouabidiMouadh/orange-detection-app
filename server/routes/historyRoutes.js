const express = require("express");
const { saveHistory, getUserHistory, deleteHistory } = require("../controllers/historyController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/", authMiddleware, saveHistory);
router.get("/:userId", authMiddleware, getUserHistory);
router.delete("/:id", authMiddleware, deleteHistory);

module.exports = router;

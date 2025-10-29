const History = require("../models/History");

// Save detection result
exports.saveHistory = async (req, res) => {
  try {
    const { contentType, contentUrl, result } = req.body;

    const history = new History({
      user: req.user.id, // comes from authMiddleware
      contentType,
      contentUrl,
      result,
    });

    await history.save();

    res.status(201).json({ message: "History saved", history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all history of a user
exports.getUserHistory = async (req, res) => {
  try {
    console.log(req.params)
    const history = await History.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email");
console.log(history)
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a history record
exports.deleteHistory = async (req, res) => {
  try {
    const history = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // only delete if it belongs to logged-in user
    });

    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    res.json({ message: "History deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

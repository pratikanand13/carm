const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path"); // Import path module
const authenticateUser = require('../middleware/authMiddleware')
const router = express.Router();

// Ensure `uploads` directory exists
const uploadDir = path.join(__dirname, "../uploads");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Car Schema and Model
const CarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    images: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", CarSchema);

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the absolute path for `uploads` directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Route Handlers

// Middleware to simulate authentication (replace this with actual authentication middleware

// Create a Car
router.post("/", authenticateUser, upload.array("images", 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];
    console.log(req.body)
    const car = await Car.create({
      title,
      description,
      tags,
      images,
      user: req.user.id,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get All Cars for the Logged-In User
router.get("/", authenticateUser, async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user.id });
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: error.message });
  }
});

// Search Cars by Keyword
router.get("/search", authenticateUser, async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: "Keyword query parameter is required" });
    }

    const regex = new RegExp(keyword, "i");

    const cars = await Car.find({
      user: req.user.id,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    });

    res.status(200).json(cars);
  } catch (error) {
    console.error("Error searching cars:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Car by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car || car.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car by ID:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a Car
router.put("/:id", authenticateUser, upload.array("images", 10), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car || car.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }

    const { title, description, tags } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : car.images;

    car.title = title || car.title;
    car.description = description || car.description;
    car.tags = tags || car.tags;
    car.images = images;

    const updatedCar = await car.save();
    res.status(200).json(updatedCar);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a Car
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car || car.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }

    await car.remove();
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

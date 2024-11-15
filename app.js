const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/ userRoutes");
const carRoutes = require("./src/routes/carRoutes");

dotenv.config();
const app = express();
connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Car Management API!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

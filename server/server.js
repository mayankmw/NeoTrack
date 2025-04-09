const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const hangoutRoutes = require("./routes/hangouts");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Default Route
app.get("/", (req, res) => {
    res.send("NeoTrack Server is Running!");
});
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hangouts", hangoutRoutes);

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Cookies = require("cookies");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Import models
const User = require('./models/User');
const NetworkDetails = require('./models/NetworkDetails');

const verifyToken = (req, res, next) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

app.get('/api/network', verifyToken, async (req, res) => {
  try {
    const pendingRequests = await NetworkDetails.find({ receiver: req.userId, status: 'pending' })
      .populate('sender', 'name summary'); // assuming User model has 'name' and 'summary' fields

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  const { name, email, username, password } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res
        .status(400)
        .json({ message: "Email or Username already in use" });
    }
    user = new User({
      name,
      email,
      username,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token in cookies
    const cookies = new Cookies(req, res);
    cookies.set("token", token, { httpOnly: true });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/home", async (req, res) => {
  try {
    const user = await User.findOne(); // Simplified query to test connection
    console.log("Test user query result:", user);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /home endpoint:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

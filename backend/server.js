const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth"); // Authentication middleware


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

const User = require("./models/User");
const Post = require("./models/Post");
const Network = require("./models/NetworkDetails")

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
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/home/:username", auth, async (req, res) => {
  const { username } = req.params;
  if (req.user.username !== username) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user, message: `Welcome back, ${user.username}!` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

app.get("/search", async (req, res) => {
  const { term, category } = req.query;
  if (!term || !category) {
    return res.status(400).json({ message: "Missing term or category" });
  }
  try {
    let results = [];
    if (category === "People") {
      results = await User.find({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { username: { $regex: term, $options: "i" } },
        ],
      });
    } else if (category === "Posts") {
      results = await Post.find({
        body: { $regex: term, $options: "i" },
      });
    } else {
      return res.status(400).json({ message: "Invalid category" });
    }
    // Return the search results
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/posts", auth, async (req, res) => {
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ message: "Post body is required" });
  }

  try {
    const newPost = new Post({
      author: req.user.username,
      timestamp: new Date(),
      body,
    });

    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/search/people", async (req, res) => {
  try {
    const { term } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: term, $options: "i" } },
        { name: { $regex: term, $options: "i" } },
      ],
    }).select("username name avatar summary");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/requests", auth, async (req, res) => {
  try {
    const requests = await Network.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "name username avatar summary")
      .sort({ timestamp: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post('/api/connect', auth, async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.user._id;
    // Check if the receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    // Check if a request already exists
    const existingRequest = await Network.findOne({
      sender,
      receiver,
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }
    // Create a new connection request
    const newRequest = new Network({
      sender,
      receiver,
      status: 'pending',
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

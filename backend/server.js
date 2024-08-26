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
const Network = require("./models/NetworkDetails");

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
      author: req.user._id,
      authorName: req.user.username,
      authorAvatar: req.user.avatar, // Assuming you have avatar in user schema
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

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

app.post("/api/posts/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(req.user._id)) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error liking post" });
  }
});

app.post("/api/posts/:id/comments", auth, async (req, res) => {
  try {
    const { body } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const comment = {
      author: req.user._id,
      authorName: user.username,
      body,
    };
    post.comments.push(comment);
    console.log(comment);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

app.delete("/api/posts/:postId/comments/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (
      comment.author.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    // Save the post after the comment has been removed
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
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

app.post("/api/connect", auth, async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.user._id;
    const receiverUser = await User.findById(receiver);
    console.log(sender);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    const existingRequest = await Network.findOne({
      sender,
      receiver,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already sent" });
    }
    const newRequest = new Network({
      sender,
      receiver,
      status: "pending",
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/posts/:username", auth, async (req, res) => {
  try {
    const username = req.params.username;
    const posts = await Post.find({ authorName: username }).sort({
      createdAt: -1,
    });
    if (!posts) {
      return res.status(404).json({ message: "No posts found for this user." });
    }
    res.status(200).json({ results: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error while fetching posts." });
  }
});

app.get("/view/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.delete("/post/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }
    await Post.deleteOne(post);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/requests/:id/:action", auth, async (req, res) => {
  const { id, action } = req.params;
  try {
    const request = await Network.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (
      request.receiver.toString() !== req.user.id &&
      request.sender.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to act on this request" });
    }
    if (action === "accept") {
      request.status = "accepted";
      await request.save();
      // Add the connection to both sender and receiver
      const sender = await User.findById(request.sender);
      const receiver = await User.findById(request.receiver);
      if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "Connection request accepted" });
    } else if (action === "reject") {
      await Network.deleteOne(request)
      return res.status(200).json({ message: "Connection request rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/connections", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const connections = await Network.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" }
      ]
    }).populate('sender receiver', 'name username'); // Populate sender and receiver

    // Filter out the current user's details
    const filteredConnections = connections.map(connection => {
      const isSender = connection.sender._id.toString() === userId;
      const userDetails = isSender ? connection.receiver : connection.sender;
      return {
        _id: connection._id,
        name: userDetails.name,
        username: userDetails.username
      };
    });

    console.log(filteredConnections); // For debugging
    res.json(filteredConnections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.listen(port, () => console.log(`Server running on port ${port}`));

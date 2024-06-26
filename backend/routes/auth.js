// backend/routes/auth.js

const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();

app.post("/register", async (req, res) => {
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
      password,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("token", token, { httpOnly: true, secure: true, sameSite: 'Strict' }) // Set cookie options as required
      .status(200)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
});

module.exports = app;

// auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path based on your project structure
const dotenv = require('dotenv')
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET; // Replace with your actual secret key

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    req.user = user; // Set the authenticated user object on req.user
    next(); // Call next middleware
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;

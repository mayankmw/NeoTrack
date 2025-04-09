const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const sendEmail = require("../utils/sendEmail");
const path = require("path");
const dotenv = require("dotenv");

// Signup Controller
exports.signup = async (req, res) => {
    try {
      const { firstName, lastName, email, password, mobile } = req.body;
  
      // Validate required fields
      if (!firstName || !lastName || !email || !password || !mobile) {
        return res.status(400).json({
          success: false,
          message:
            "All fields (firstName, lastName, email, password, mobile) are required",
        });
      }
  
      // Check for existing user
      const existingMail = await User.findOne({ email });
      if (existingMail) {
        return res.status(400).json({
          success: false,
          message: "email already registered",
        });
      }
      const existingNumber = await User.findOne({ mobile });
      if (existingNumber) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already registered",
        });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        mobile, // Save mobile number
      });
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      // Attempt to send welcome email
      try {
        await sendEmail(
          email,
          "Welcome to NeoTrack!",
          `Hi ${firstName}, welcome to NeoTrack! We're excited to have you on board.`,
          path.join(__dirname, "../html/signUp.html"),
          { firstName }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError.message);
        // Log the error but don't throw it, so the API call remains successful
      }
  
      // Respond with success
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile, // Include mobile in response
          token,
        },
      });
    } catch (error) {
      console.error("Signup Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  
  
// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (email, password) are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

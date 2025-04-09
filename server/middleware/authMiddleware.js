const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No token provided.",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error while verifying token.",
      });
    }
  }
};

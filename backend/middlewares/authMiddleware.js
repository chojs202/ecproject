// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "You do not have an authentication token. Please log in and use it.",
    });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    // ✅ 에러 유형 세분화
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Your login session has expired. Please log in again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid token.",
      });
    } else {
      return res.status(401).json({
        success: false,
        code: "AUTH_ERROR",
        message: "An error occurred during authentication.",
      });
    }
  }
};

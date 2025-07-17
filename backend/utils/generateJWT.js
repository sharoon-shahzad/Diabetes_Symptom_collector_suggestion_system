import jwt from "jsonwebtoken";

// Generate access token (short-lived - 15 minutes)
export const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { userId, email }, 
    process.env.JWT_SECRET, 
    { expiresIn: "15m" }
  );
};

// Generate refresh token (long-lived - 7 days)
export const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { userId, email }, 
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}; 
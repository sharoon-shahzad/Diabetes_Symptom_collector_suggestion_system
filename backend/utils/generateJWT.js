import jwt from "jsonwebtoken";

export const generateJWT = (id, email) => {
  return jwt.sign({ id, email}, "jwt_secret", { expiresIn: "30d" });
};

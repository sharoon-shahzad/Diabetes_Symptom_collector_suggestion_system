import express from "express";

import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

//!in built middleware
//to parse the body of the request
app.use(express.json());
app.use(cookieParser());

connectDB();

//! check 
app.get("/", (req, res) => {
    res.send("Hello World");
});

//! Routes
app.use("/api/v1/auth", authRoutes);






//? user Routes
//? admin Routes
//? doctor routes Routes






    
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
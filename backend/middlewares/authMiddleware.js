import jwt from "jsonwebtoken";
import User from "../models/User";

export const verifyAccessToken = async (req , res , next)=> {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?.id).select("-password -refreshToken");


        if(!user){
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        req.user = user;
        next();



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
}
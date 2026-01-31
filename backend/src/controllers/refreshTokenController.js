import User from "../models/User.js";
import pool from "../config/database.js";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";

export const refreshToken = async (req, res) => {
    try{
        const refreshedToken = req.cookies.refreshToken
        if(!refreshedToken){
            return res.status(401).json({
                success : false,
                message : "Unauthorized"
            });
        }
        
        // Find user by refresh token
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE refresh_token = ?',
            [refreshedToken]
        );
        const user = rows[0];
        
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        
        // Verify token validity (will throw error if expired/invalid)
        jwt.verify(refreshedToken, process.env.JWT_REFRESH_SECRET);
        
        // Generate new access token dengan id dan role
        const newAccessToken = generateToken({ id: user.id, role: user.role });
        
        // Generate new refresh token dengan id dan role
        const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });
        
        // Simpan refresh token baru ke database
        await User.updateRefreshToken(user.id, newRefreshToken);
        
        // Set cookie baru untuk refresh token
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success : true,
            message : "Token refreshed successfully",
            data : {
                accessToken : newAccessToken
            }
        })
    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
}
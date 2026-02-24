import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/tokenHash.js";

export const refreshToken = async (req, res) => {
    try {
        const refreshedToken = req.cookies.refreshToken;
        if (!refreshedToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        let decodedPayload;
        try {
            decodedPayload = jwt.verify(refreshedToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const refreshTokenHash = hashToken(refreshedToken);
        const user = await User.findByRefreshToken(refreshTokenHash);

        if (!user || user.id !== decodedPayload.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = generateToken({ id: user.id, role: user.role });
        const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

        await User.updateRefreshToken(user.id, hashToken(newRefreshToken));

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        console.error("[refreshToken]", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { blacklistToken } from "../utils/blacklistToken.js";


export const register = async (req, res) => {
    try {
        const { nik, name, username, email, password, phone, role } = req.body;
        
        // Check for existing user with same unique fields
        const existingUser = await User.findByEmailOrUsernameOrNikOrPhone(
            email || '', username || '', nik || '', phone || ''
        );
        
        if (existingUser) {
            let duplicateField = '';
            if (username && existingUser.username === username) duplicateField = 'Username';
            else if (email && existingUser.email === email) duplicateField = 'Email';
            else if (nik && existingUser.nik === nik) duplicateField = 'NIK';
            else if (phone && existingUser.phone === phone) duplicateField = 'Phone number';
            return res.status(400).json({
                success: false,
                message: `${duplicateField} already exists`
            });
        }
        
        // Hash password sebelum simpan
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const userId = await User.create({
            nik,
            name,
            username: username || null,
            email: email || null,
            password: hashedPassword,
            role: role || 'Nasabah',
            phone
        });
        
        const user = await User.findById(userId);
        delete user.password;
        
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const login = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        if(!password){
            return res.status(400).json({
                success : false,
                message : "Password is required"
            });
        }
        
        // Find user by username or email
        let user = null;
        if (username) {
            user = await User.findByUsername(username);
        }
        if (!user && email) {
            user = await User.findByEmail(email);
        }
        
        if (!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success : false,
                message : "Invalid password"
            });
        }
        
        const payload = {
            id : user.id,
            role : user.role
        }
        const token = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        // Update refresh token di database
        await User.updateRefreshToken(user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly : true,
            secure : true,
            sameSite : "strict",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        // Remove sensitive data
        delete user.password;
        delete user.refresh_token;

        res.status(200).json({
            success : true,
            message : "User logged in successfully",
            data : {
                user,
                token,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const logout = async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.status(401).json({
                success : false,
                message : "Unauthorized"
            });
        }
        blacklistToken(token)
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            // Clear refresh token in database - find user by refresh token and clear it
            const users = await User.findAll();
            for (const u of users) {
                if (u.refresh_token === refreshToken) {
                    await User.updateRefreshToken(u.id, null);
                    break;
                }
            }
        }
        res.clearCookie("refreshToken", {
            httpOnly : true,
            secure : true,
            sameSite : "strict"
        })
        
        res.status(200).json({
            success : true,
            message : "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    delete user.password;
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    await User.update(userId, { name, email });
    const updatedUser = await User.findById(userId);
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(userId, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
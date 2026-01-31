import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAllUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const allUsers = await User.findAll();
        const paginatedUsers = allUsers.slice(offset, offset + limit);
        
        // Remove password from each user
        const users = paginatedUsers.map(user => {
            delete user.password;
            delete user.refresh_token;
            return user;
        });
        
        const totalUser = await User.count();
        const totalPages = Math.ceil(totalUser / limit);
        
        res.status(200).json({ 
            success : true,
            message : "User fetched successfully",
            data : users,
            totalUser,
            totalPages,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if(isNaN(userId)){
            return res.status(400).json({
                success : false,
                message : "User id is invalid"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        delete user.password;
        delete user.refresh_token;
        
        res.status(200).json({
            success : true,
            message : "User fetched successfully",
            data : user
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const createUser = async (req, res) => {
    try {
        const { nik, name, username, email, password, phone, role } = req.body;
        
        if(role === "Admin" || role === "Pimpinan" || role === "Staf"){
            if( !name || !username || !password){
                return res.status(400).json({
                    success : false,
                    message : "Name, username and password are required for Admin, Pimpinan and Staf"
                });
            }
            // Admin, Pimpinan, Staf tidak boleh punya email, nik, dan phone
            if (email || nik || phone) {
                return res.status(400).json({
                    success : false,
                    message : "Admin, Pimpinan and Staf cannot have email, NIK, or phone"
                });
            }
        }
        if(role === "Nasabah"){
            if (!nik || !name || !email || !password || !phone) {
                return res.status(400).json({
                    success : false,
                    message : "NIK, name, email, password and phone are required for Nasabah"
                });
            }
            // Nasabah tidak boleh punya username
            if (username) {
                return res.status(400).json({
                    success : false,
                    message : "Nasabah cannot have username"
                });
            }
        }
        
        // Check if user already exists
        const existingUser = await User.findByEmailOrUsernameOrNikOrPhone(
            email || '', username || '', nik || '', phone || ''
        );
        if (existingUser) {
            return res.status(400).json({
                success : false,
                message : "User already exists"
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userId = await User.create({
            nik,
            name,
            username: username || null,
            email: email || null,
            password: hashedPassword, 
            role, 
            phone
        });
        
        const user = await User.findById(userId);
        delete user.password;
        delete user.refresh_token;
        
        res.status(201).json({
            success : true,
            message : "User created successfully",
            data : user
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if(isNaN(userId)){
            return res.status(400).json({
                success : false,
                message : "User id is invalid"
            });
        }
        
        // Check if username or email already exists for other users
        const { username, email } = req.body;
        if (username) {
            const existingByUsername = await User.findByUsername(username);
            if (existingByUsername && existingByUsername.id !== userId) {
                return res.status(400).json({
                    success : false,
                    message : "Username already exists"
                });
            }
        }
        if (email) {
            const existingByEmail = await User.findByEmail(email);
            if (existingByEmail && existingByEmail.id !== userId) {
                return res.status(400).json({
                    success : false,
                    message : "Email already exists"
                });
            }
        }
        
        // Hash password if provided
        const updateData = { ...req.body };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        const updated = await User.update(userId, updateData);
        if (!updated) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        
        const user = await User.findById(userId);
        delete user.password;
        delete user.refresh_token;
        
        res.status(200).json({
            success : true,
            message : "User updated successfully",
            data : user
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if(isNaN(userId)){
            return res.status(400).json({
                success : false,
                message : "User id is invalid"
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        
        await User.delete(userId);
        delete user.password;
        delete user.refresh_token;
        
        res.status(200).json({
            success : true,
            message : "User deleted successfully",
            data : user
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

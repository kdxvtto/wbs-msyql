import Complaint from "../models/Complaint.js";
import ComplaintImage from "../models/ComplaintImage.js";
import { deleteCloudinaryImage, getPublicIdFromUrl } from "../config/cloudinary.js";
import { createActivityLog } from "./activityLogController.js";

export const getAllComplaint = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Get complaints with pagination (need custom query for limit/offset)
        const complaints = await Complaint.findAll();
        const paginatedComplaints = complaints.slice(offset, offset + limit);
        
        // Get images for each complaint
        for (const complaint of paginatedComplaints) {
            const images = await ComplaintImage.findByComplaintId(complaint.id);
            complaint.images = images.map(img => img.image_url);
        }
        
        const totalComplaint = await Complaint.count();
        const totalPages = Math.ceil(totalComplaint / limit);
        
        res.status(200).json({
            success : true,
            message : "Complaint fetched successfully",
            data : paginatedComplaints,
            totalComplaint,
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

export const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const complaintId = parseInt(id);
        if(isNaN(complaintId)){
            return res.status(400).json({
                success : false,
                message : "Complaint id is invalid"
            });
        }
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success : false,
                message : "Complaint not found"
            });
        }
        
        // Get images
        const images = await ComplaintImage.findByComplaintId(complaintId);
        complaint.images = images.map(img => img.image_url);
        
        res.status(200).json({
            success : true,
            message : "Complaint fetched successfully",
            data : complaint
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const createComplaint = async (req, res) => {
    const imagePaths = req.files ? req.files.map(f => f.path) : [];
    try {
        const { category, location, condition, description } = req.body;
        if (!category || !location || !condition || !description) {
            return res.status(400).json({
                success : false,
                message : "Category, location, condition and description are required"
            });
        }
        
        const complaintId = await Complaint.create({ 
            user_id: req.user.id, 
            category_id: parseInt(category), 
            location, 
            condition, 
            description 
        });
        
        // Save images
        if (imagePaths.length > 0) {
            await ComplaintImage.createMany(complaintId, imagePaths);
        }
        
        const complaint = await Complaint.findById(complaintId);
        complaint.images = imagePaths;
        
        // Log activity
        await createActivityLog({
            action: 'create',
            resource: 'complaint',
            resource_name: description.substring(0, 50),
            resource_id: complaintId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(201).json({
            success : true,
            message : "Complaint created successfully",
            data : complaint
        });
    } catch (error) {
        console.error("Create Complaint Error:", error);
        // Cleanup uploaded images on error
        if (imagePaths.length > 0) {
            for (const imgPath of imagePaths) {
                const public_id = getPublicIdFromUrl(imgPath);
                deleteCloudinaryImage(public_id);
            }
        }
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const updateComplaint = async (req, res) => {
    const newImages = req.files ? req.files.map(f => f.path) : [];
    try {
        const { id } = req.params;
        const complaintId = parseInt(id);
        if(isNaN(complaintId)){
            // Cleanup uploaded images if validation fails
            if(newImages.length > 0){
                for (const img of newImages) {
                    const public_id = getPublicIdFromUrl(img);
                    deleteCloudinaryImage(public_id);
                }
            }
            return res.status(400).json({
                success : false,
                message : "Complaint id is invalid"
            });
        }
        
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            // Cleanup uploaded images if complaint not found
            if(newImages.length > 0){
                for (const img of newImages) {
                    const public_id = getPublicIdFromUrl(img);
                    deleteCloudinaryImage(public_id);
                }
            }
            return res.status(404).json({
                success : false,
                message : "Complaint not found"
            });
        }

        // Get old images
        const oldImages = await ComplaintImage.findByComplaintId(complaintId);
        
        // Update complaint fields
        const updateData = {};
        if (req.body.category) updateData.category_id = parseInt(req.body.category);
        if (req.body.location) updateData.location = req.body.location;
        if (req.body.condition) updateData.condition = req.body.condition;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.status) updateData.status = req.body.status;
        
        await Complaint.update(complaintId, updateData);
        
        // Handle images
        if (newImages.length > 0) {
            // Delete old images from database
            await ComplaintImage.deleteByComplaintId(complaintId);
            // Add new images
            await ComplaintImage.createMany(complaintId, newImages);
            
            // Delete old images from Cloudinary
            for (const img of oldImages) {
                const public_id = getPublicIdFromUrl(img.image_url);
                deleteCloudinaryImage(public_id);
            }
        }
        
        const updatedComplaint = await Complaint.findById(complaintId);
        const images = await ComplaintImage.findByComplaintId(complaintId);
        updatedComplaint.images = images.map(img => img.image_url);
        
        // Log activity
        await createActivityLog({
            action: 'update',
            resource: 'complaint',
            resource_name: updatedComplaint.description?.substring(0, 50) || 'Complaint',
            resource_id: complaintId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Complaint updated successfully",
            data : updatedComplaint
        });
    } catch (error) {
        console.error('Update Complaint Error:', error);
        // Cleanup uploaded images on error
        if(newImages.length > 0){
            for (const img of newImages) {
                const public_id = getPublicIdFromUrl(img);
                deleteCloudinaryImage(public_id);
            }
        }
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaintId = parseInt(id);
        if(isNaN(complaintId)){
            return res.status(400).json({
                success : false,
                message : "Complaint id is invalid"
            });
        }
        
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success : false,
                message : "Complaint not found"
            });
        }
        
        // Get images before delete
        const images = await ComplaintImage.findByComplaintId(complaintId);
        
        // Delete complaint (images will cascade delete due to foreign key)
        await Complaint.delete(complaintId);
        
        // Delete images from Cloudinary
        for (const img of images) {
            const public_id = getPublicIdFromUrl(img.image_url);
            deleteCloudinaryImage(public_id);
        }
        
        // Log activity
        await createActivityLog({
            action: 'delete',
            resource: 'complaint',
            resource_name: complaint.description?.substring(0, 50) || 'Complaint',
            resource_id: complaintId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Complaint deleted successfully",
            data : complaint
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}
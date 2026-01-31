import Response from "../models/Response.js";
import Complaint from "../models/Complaint.js";
import { createActivityLog } from "./activityLogController.js";

export const getAllResponse = async (req, res) => {
    try {
        const { idComplaint } = req.query;
        let responses;
        
        if (idComplaint) {
            const complaintId = parseInt(idComplaint);
            responses = await Response.findByComplaintId(complaintId);
        } else {
            responses = await Response.findAll();
        }
        
        res.status(200).json({
            success : true,
            message : "Response fetched successfully",
            data : responses
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const getResponseById = async (req, res) => {
    try {
        const { id } = req.params;
        const responseId = parseInt(id);
        if(isNaN(responseId)){
            return res.status(400).json({
                success : false,
                message : "Response id is invalid"
            });
        }
        const response = await Response.findById(responseId);
        if (!response) {
            return res.status(404).json({
                success : false,
                message : "Response not found"
            });
        }
        res.status(200).json({
            success : true,
            message : "Response fetched successfully",
            data : response
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const createResponse = async (req, res) => {
    try {
        const { idComplaint, status, progress, response: responseText } = req.body;
        const complaintId = parseInt(idComplaint);
        if(isNaN(complaintId)){
            return res.status(400).json({
                success : false,
                message : "Complaint id is invalid"
            });
        }
        
        // Cek apakah pengaduan sudah selesai
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success : false,
                message : "Complaint not found"
            });
        }
        
        // Jika pengaduan sudah selesai dan bukan admin, tolak
        if (complaint.status === 'completed' && req.user.role !== 'Admin') {
            return res.status(403).json({
                success : false,
                message : "Pengaduan sudah selesai. Hanya Admin yang dapat menambah respon."
            });
        }
        
        const responseId = await Response.create({ 
            complaint_id: complaintId, 
            user_id: req.user.id, 
            status, 
            progress, 
            response: responseText 
        });
        
        const newResponse = await Response.findById(responseId);
        
        // Log activity
        await createActivityLog({
            action: 'create',
            resource: 'response',
            resource_name: responseText?.substring(0, 50) || 'Response',
            resource_id: responseId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(201).json({
            success : true,
            message : "Response created successfully",
            data : newResponse
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const updateResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const responseId = parseInt(id);
        if(isNaN(responseId)){
            return res.status(400).json({
                success : false,
                message : "Response id is invalid"
            });
        }
        
        const existingResponse = await Response.findById(responseId);
        if (!existingResponse) {
            return res.status(404).json({
                success : false,
                message : "Response not found"
            });
        }
        
        await Response.update(responseId, req.body);
        const response = await Response.findById(responseId);
        
        // Log activity
        await createActivityLog({
            action: 'update',
            resource: 'response',
            resource_name: response.response?.substring(0, 50) || 'Response',
            resource_id: responseId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Response updated successfully",
            data : response
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const deleteResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const responseId = parseInt(id);
        if(isNaN(responseId)){
            return res.status(400).json({
                success : false,
                message : "Response id is invalid"
            });
        }
        
        const response = await Response.findById(responseId);
        if (!response) {
            return res.status(404).json({
                success : false,
                message : "Response not found"
            });
        }
        
        await Response.delete(responseId);
        
        // Log activity
        await createActivityLog({
            action: 'delete',
            resource: 'response',
            resource_name: response.response?.substring(0, 50) || 'Response',
            resource_id: responseId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Response deleted successfully",
            data : response
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}
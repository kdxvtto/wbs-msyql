import Response from "../models/Response.js";
import Complaint from "../models/Complaint.js";
import { createActivityLog } from "./activityLogController.js";
import { sanitize, sanitizeObject } from "../utils/sanitize.js";

const respondServerError = (res, context, error) => {
    console.error(`[${context}]`, error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

export const getAllResponse = async (req, res) => {
    try {
        const { idComplaint } = req.query;
        const isNasabah = req.user.role === "Nasabah";
        let responses;
        
        if (idComplaint) {
            const complaintId = parseInt(idComplaint);
            if (isNaN(complaintId)) {
                return res.status(400).json({
                    success : false,
                    message : "Complaint id is invalid"
                });
            }
            responses = isNasabah
                ? await Response.findByComplaintIdAndUser(complaintId, req.user.id)
                : await Response.findByComplaintId(complaintId);
        } else {
            responses = isNasabah
                ? await Response.findAllByUserId(req.user.id)
                : await Response.findAll();
        }
        
        res.status(200).json({
            success : true,
            message : "Response fetched successfully",
            data : responses
        });
    } catch (error) {
        return respondServerError(res, "getAllResponse", error);
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
        const response = req.user.role === "Nasabah"
            ? await Response.findByIdAndUser(responseId, req.user.id)
            : await Response.findById(responseId);
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
        return respondServerError(res, "getResponseById", error);
    }
}

export const createResponse = async (req, res) => {
    try {
        const { idComplaint, status: rawStatus, progress: rawProgress, response: rawResponseText } = req.body;
        const status = sanitize(rawStatus);
        const progress = sanitize(rawProgress);
        const responseText = sanitize(rawResponseText);
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
        return respondServerError(res, "createResponse", error);
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
        
        const updated = await Response.update(responseId, sanitizeObject(req.body));
        if (!updated) {
            return res.status(400).json({
                success : false,
                message : "No valid fields to update"
            });
        }
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
        return respondServerError(res, "updateResponse", error);
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
        return respondServerError(res, "deleteResponse", error);
    }
}

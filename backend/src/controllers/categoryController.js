import Category from "../models/Category.js";
import { createActivityLog } from "./activityLogController.js";
import { sanitize } from "../utils/sanitize.js";

const respondServerError = (res, context, error) => {
    console.error(`[${context}]`, error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

export const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({
            success : true,
            message : "Category fetched successfully",
            data : categories
        });
    } catch (error) {
        return respondServerError(res, "getAllCategory", error);
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);
        if(isNaN(categoryId)){
            return res.status(400).json({
                success : false,
                message : "Category id is invalid"
            });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success : false,
                message : "Category not found"
            });
        }
        res.status(200).json({
            success : true,
            message : "Category fetched successfully",
            data : category
        });
    } catch (error) {
        return respondServerError(res, "getCategoryById", error);
    }
}

export const createCategory = async (req, res) => {
    try {
        const { name: rawName } = req.body;
        const name = sanitize(rawName);
        if (!name) {
            return res.status(400).json({
                success : false,
                message : "Category name is required"
            });
        }
        
        // Check if category already exists
        const existing = await Category.findByName(name);
        if (existing) {
            return res.status(400).json({
                success : false,
                message : "Category already exists"
            });
        }
        
        const categoryId = await Category.create(name);
        const category = await Category.findById(categoryId);
        
        // Log activity
        await createActivityLog({
            action: 'create',
            resource: 'category',
            resource_name: name,
            resource_id: categoryId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(201).json({
            success : true,
            message : "Category created successfully",
            data : category
        });
    } catch (error) {
        return respondServerError(res, "createCategory", error);
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);
        if(isNaN(categoryId)){
            return res.status(400).json({
                success : false,
                message : "Category id is invalid"
            });
        }
        
        const { name: rawName } = req.body;
        const name = sanitize(rawName);
        
        // Check if category name already exists (excluding current)
        const existingCategory = await Category.findByName(name);
        if (existingCategory && existingCategory.id !== categoryId) {
            return res.status(400).json({
                success : false,
                message : "Category already exists"
            });
        }
        
        const updated = await Category.update(categoryId, name);
        if (!updated) {
            return res.status(404).json({
                success : false,
                message : "Category not found"
            });
        }
        
        const category = await Category.findById(categoryId);
        
        // Log activity
        await createActivityLog({
            action: 'update',
            resource: 'category',
            resource_name: category.name,
            resource_id: categoryId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Category updated successfully",
            data : category
        });
    } catch (error) {
        return respondServerError(res, "updateCategory", error);
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);
        if(isNaN(categoryId)){
            return res.status(400).json({
                success : false,
                message : "Category id is invalid"
            });
        }
        
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success : false,
                message : "Category not found"
            });
        }
        
        await Category.delete(categoryId);
        
        // Log activity
        await createActivityLog({
            action: 'delete',
            resource: 'category',
            resource_name: category.name,
            resource_id: categoryId,
            user_id: req.user.id,
            user_name: req.user.name || req.user.username
        });
        
        res.status(200).json({
            success : true,
            message : "Category deleted successfully",
            data : category
        });
    } catch (error) {
        return respondServerError(res, "deleteCategory", error);
    }
}

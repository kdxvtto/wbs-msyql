import Category from "../models/Category.js";
import { createActivityLog } from "./activityLogController.js";

export const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({
            success : true,
            message : "Category fetched successfully",
            data : categories
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
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
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
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
        res.status(500).json({
            success : false,
            message : error.message
        });
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
        
        const { name } = req.body;
        
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
        res.status(500).json({
            success : false,
            message : error.message
        });
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
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

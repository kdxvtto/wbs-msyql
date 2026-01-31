import ActivityLog from "../models/ActivityLog.js";

// Create activity log entry
export const createActivityLog = async ({ action, resource, resource_name, resource_id, user_id, user_name }) => {
    try {
        const logId = await ActivityLog.create({
            action,
            resource,
            resource_name,
            resource_id,
            user_id,
            user_name
        });
        return logId;
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};

// Get recent activity logs
export const getActivityLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const logs = await ActivityLog.findAll(limit);
        
        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

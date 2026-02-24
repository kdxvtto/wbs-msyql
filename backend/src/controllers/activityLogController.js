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
        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(parsedLimit) ? 10 : Math.min(Math.max(parsedLimit, 1), 100);
        const logs = await ActivityLog.findAll(limit);
        
        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error("[getActivityLogs]", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

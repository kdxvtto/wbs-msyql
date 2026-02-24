import express from "express";
import { getActivityLogs } from "../controllers/activityLogController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";

const router = express.Router();

// Get recent activity logs (protected)
router.get("/", verifyToken, checkRole(["Admin", "Pimpinan", "Staf"]), getActivityLogs);

export default router;

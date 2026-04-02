import express from "express";
import {
    getAllLabResults,
    getLabResultById,
    getLabResultsByOrderId,
    getCriticalLabResults,
    createLabResultHandler,
    updateLabResult,
    deleteLabResult
} from "../controllers/labResult.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Specific routes before parameterized routes
router.get("/critical",           protect, getCriticalLabResults);
router.get("/order/:labOrderId",  protect, getLabResultsByOrderId);
router.get("/",                   protect, getAllLabResults);
router.get("/:id",                protect, getLabResultById);
router.post("/",                  protect, authorize("Admin", "Lab Technician"),         createLabResultHandler);
router.put("/:id",                protect, authorize("Admin", "Lab Technician"),         updateLabResult);
router.delete("/:id",             protect, authorize("Admin"),                            deleteLabResult);

export default router;
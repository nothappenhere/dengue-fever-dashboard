import express from "express";
import {
  getDengueStats,
  getCasesByYear,
  getCasesByProvince,
  getDengueTrends,
  getHighRiskAreas,
  getCaseDetails,
  getChartData,
} from "../controllers/dengueController.js";
// import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

// All dengue routes require authentication
// router.use(validateToken);

/**
 * @desc Get dengue statistics summary
 * @route GET /api/dengue/stats
 */
router.get("/stats", getDengueStats);

/**
 * @desc Get dengue cases by year
 * @route GET /api/dengue/cases-by-year
 */
router.get("/cases-by-year", getCasesByYear);

/**
 * @desc Get dengue cases by province
 * @route GET /api/dengue/cases-by-province
 */
router.get("/cases-by-province", getCasesByProvince);

/**
 * @desc Get dengue trends over years
 * @route GET /api/dengue/trends
 */
router.get("/trends", getDengueTrends);

/**
 * @desc Get high-risk areas
 * @route GET /api/dengue/high-risk-areas
 */
router.get("/high-risk-areas", getHighRiskAreas);

/**
 * @desc Get detailed case information
 * @route GET /api/dengue/case-details
 */
router.get("/case-details", getCaseDetails);

/**
 * @desc Get comprehensive chart data
 * @route GET /api/dengue/chart-data
 */
router.get("/chart-data", getChartData);

export default router;

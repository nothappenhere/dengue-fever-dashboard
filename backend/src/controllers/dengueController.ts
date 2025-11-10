import { Request, Response } from "express";
import { DengueCase } from "../models/DengueCase.js";
import { sendResponse } from "../utils/sendResponse.js";
import { AuthRequest } from "../types/index.js";

/**
 * @desc Get dengue statistics summary
 * @route GET /api/dengue/stats
 */
export const getDengueStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();

    // Cari tahun terakhir yang ada data di database
    let latestYearData = await DengueCase.aggregate([
      { $group: { _id: null, maxYear: { $max: "$year" } } },
    ]);

    const latestYear = latestYearData[0]?.maxYear || currentYear;
    const previousYear = latestYear - 1;

    console.log(
      `Using latest year: ${latestYear}, previous year: ${previousYear}`
    );

    // Get latest year data
    latestYearData = await DengueCase.aggregate([
      { $match: { year: latestYear } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
          maleDeaths: { $sum: "$maleDeaths" },
          femaleDeaths: { $sum: "$femaleDeaths" },
          provinceCount: { $addToSet: "$provinceCode" },
          regencyCount: { $addToSet: "$regencyCode" },
        },
      },
    ]);

    // Get previous year data for comparison
    const previousYearData = await DengueCase.aggregate([
      { $match: { year: previousYear } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
        },
      },
    ]);

    // Get top provinces for latest year
    const topProvinces = await DengueCase.aggregate([
      { $match: { year: latestYear } },
      {
        $group: {
          _id: "$provinceName",
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: 5 },
    ]);

    const latestStats = latestYearData[0] || {
      totalCases: 0,
      totalDeaths: 0,
      maleDeaths: 0,
      femaleDeaths: 0,
      provinceCount: [],
      regencyCount: [],
    };

    const previousStats = previousYearData[0] || {
      totalCases: 0,
      totalDeaths: 0,
    };

    // Calculate trends
    const caseTrend =
      previousStats.totalCases > 0
        ? (
            ((latestStats.totalCases - previousStats.totalCases) /
              previousStats.totalCases) *
            100
          ).toFixed(1)
        : "0";

    const deathTrend =
      previousStats.totalDeaths > 0
        ? (
            ((latestStats.totalDeaths - previousStats.totalDeaths) /
              previousStats.totalDeaths) *
            100
          ).toFixed(1)
        : "0";

    const caseFatalityRate =
      latestStats.totalCases > 0
        ? ((latestStats.totalDeaths / latestStats.totalCases) * 100).toFixed(2)
        : "0";

    sendResponse(res, 200, true, "Dengue statistics retrieved successfully", {
      summary: {
        totalCases: latestStats.totalCases,
        totalDeaths: latestStats.totalDeaths,
        maleDeaths: latestStats.maleDeaths,
        femaleDeaths: latestStats.femaleDeaths,
        caseFatalityRate: parseFloat(caseFatalityRate),
        affectedProvinces: latestStats.provinceCount?.length || 0,
        affectedRegencies: latestStats.regencyCount?.length || 0,
        trends: {
          cases: parseFloat(caseTrend),
          deaths: parseFloat(deathTrend),
        },
        dataYear: latestYear, // Tambahkan info tahun data
      },
      topProvinces,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get dengue cases by year
 * @route GET /api/dengue/cases-by-year?year=2024
 */
export const getCasesByYear = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { year } = req.query;

    // Jika tidak ada parameter year, gunakan tahun terakhir yang ada data
    let queryYear;
    if (year) {
      queryYear = parseInt(year as string);
    } else {
      const latestYearData = await DengueCase.aggregate([
        { $group: { _id: null, maxYear: { $max: "$year" } } },
      ]);
      queryYear = latestYearData[0]?.maxYear || new Date().getFullYear();
    }

    console.log(`Querying data for year: ${queryYear}`);

    const cases = await DengueCase.find({ year: queryYear })
      .select(
        "provinceName regencyName totalCases totalDeaths caseFatalityRate month"
      )
      .sort({ totalCases: -1 });

    // Group by month for trend data
    const monthlyData = await DengueCase.aggregate([
      { $match: { year: queryYear } },
      {
        $group: {
          _id: "$month",
          cases: { $sum: "$totalCases" },
          deaths: { $sum: "$totalDeaths" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendResponse(
      res,
      200,
      true,
      "Dengue cases by year retrieved successfully",
      {
        year: queryYear,
        totalRecords: cases.length,
        cases,
        monthlyTrend: monthlyData,
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get dengue cases by province with regency view option
 * @route GET /api/dengue/cases-by-province?provinceCode=32&view=regency
 */
export const getCasesByProvince = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { provinceCode, year, view = "province" } = req.query;

    // Jika tidak ada parameter year, gunakan tahun terakhir yang ada data
    let queryYear;
    if (year) {
      queryYear = parseInt(year as string);
    } else {
      const latestYearData = await DengueCase.aggregate([
        { $group: { _id: null, maxYear: { $max: "$year" } } },
      ]);
      queryYear = latestYearData[0]?.maxYear || new Date().getFullYear();
    }

    console.log(`Querying data for year: ${queryYear}, view: ${view}`);

    if (view === "regency") {
      // Data per kabupaten/kota
      const regencyData = await DengueCase.aggregate([
        { $match: { year: queryYear } },
        {
          $group: {
            _id: {
              regencyCode: "$regencyCode",
              regencyName: "$regencyName",
              provinceName: "$provinceName",
            },
            totalCases: { $sum: "$totalCases" },
            totalDeaths: { $sum: "$totalDeaths" },
            maleDeaths: { $sum: "$maleDeaths" },
            femaleDeaths: { $sum: "$femaleDeaths" },
          },
        },
        {
          $project: {
            regencyCode: "$_id.regencyCode",
            regencyName: "$_id.regencyName",
            provinceName: "$_id.provinceName",
            totalCases: 1,
            totalDeaths: 1,
            maleDeaths: 1,
            femaleDeaths: 1,
            caseFatalityRate: {
              $cond: {
                if: { $eq: ["$totalCases", 0] },
                then: 0,
                else: {
                  $multiply: [
                    { $divide: ["$totalDeaths", "$totalCases"] },
                    100,
                  ],
                },
              },
            },
          },
        },
        { $sort: { totalCases: -1 } },
        { $limit: 15 },
      ]);

      sendResponse(
        res,
        200,
        true,
        "Dengue cases by regency retrieved successfully",
        {
          regencyData,
          dataYear: queryYear,
          view: "regency",
        }
      );
    } else {
      // Original province view
      const matchStage: any = { year: queryYear };
      if (provinceCode) {
        matchStage.provinceCode = provinceCode as string;
      }

      const provinceData = await DengueCase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$provinceName",
            provinceCode: { $first: "$provinceCode" },
            totalCases: { $sum: "$totalCases" },
            totalDeaths: { $sum: "$totalDeaths" },
            maleDeaths: { $sum: "$maleDeaths" },
            femaleDeaths: { $sum: "$femaleDeaths" },
            regencyCount: { $addToSet: "$regencyName" },
          },
        },
        {
          $project: {
            provinceName: "$_id",
            provinceCode: 1,
            totalCases: 1,
            totalDeaths: 1,
            maleDeaths: 1,
            femaleDeaths: 1,
            caseFatalityRate: {
              $cond: {
                if: { $eq: ["$totalCases", 0] },
                then: 0,
                else: {
                  $multiply: [
                    { $divide: ["$totalDeaths", "$totalCases"] },
                    100,
                  ],
                },
              },
            },
            affectedRegencies: { $size: "$regencyCount" },
          },
        },
        { $sort: { totalCases: -1 } },
      ]);

      sendResponse(
        res,
        200,
        true,
        "Dengue cases by province retrieved successfully",
        {
          provinceData,
          dataYear: queryYear,
          view: "province",
        }
      );
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in getCasesByProvince:", errorMessage);
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get dengue trends over years
 * @route GET /api/dengue/trends?years=5
 */
export const getDengueTrends = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { years = 5 } = req.query;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - parseInt(years as string);

    const yearlyTrends = await DengueCase.aggregate([
      { $match: { year: { $gte: startYear, $lte: currentYear } } },
      {
        $group: {
          _id: "$year",
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
          maleDeaths: { $sum: "$maleDeaths" },
          femaleDeaths: { $sum: "$femaleDeaths" },
          provinceCount: { $addToSet: "$provinceCode" },
        },
      },
      {
        $project: {
          year: "$_id",
          totalCases: 1,
          totalDeaths: 1,
          maleDeaths: 1,
          femaleDeaths: 1,
          caseFatalityRate: {
            $cond: {
              if: { $eq: ["$totalCases", 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ["$totalDeaths", "$totalCases"] }, 100],
              },
            },
          },
          affectedProvinces: { $size: "$provinceCount" },
        },
      },
      { $sort: { year: 1 } },
    ]);

    sendResponse(res, 200, true, "Dengue trends retrieved successfully", {
      trends: yearlyTrends,
      period: `${startYear}-${currentYear}`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get high-risk areas
 * @route GET /api/dengue/high-risk-areas?limit=10
 */
export const getHighRiskAreas = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10, year } = req.query;

    // Jika tidak ada parameter year, gunakan tahun terakhir yang ada data
    let queryYear;
    if (year) {
      queryYear = parseInt(year as string);
    } else {
      const latestYearData = await DengueCase.aggregate([
        { $group: { _id: null, maxYear: { $max: "$year" } } },
      ]);
      queryYear = latestYearData[0]?.maxYear || new Date().getFullYear();
    }

    console.log(`Querying high risk areas for year: ${queryYear}`);

    const highRiskAreas = await DengueCase.aggregate([
      { $match: { year: queryYear } },
      {
        $group: {
          _id: {
            regencyCode: "$regencyCode",
            regencyName: "$regencyName",
            provinceName: "$provinceName",
          },
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
        },
      },
      {
        $project: {
          regencyCode: "$_id.regencyCode",
          regencyName: "$_id.regencyName",
          provinceName: "$_id.provinceName",
          totalCases: 1,
          totalDeaths: 1,
          caseFatalityRate: {
            $cond: {
              if: { $eq: ["$totalCases", 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ["$totalDeaths", "$totalCases"] }, 100],
              },
            },
          },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    sendResponse(res, 200, true, "High-risk areas retrieved successfully", {
      highRiskAreas,
      year: queryYear,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get detailed case information
 * @route GET /api/dengue/case-details
 */
export const getCaseDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { regencyCode, year } = req.query;
    const queryYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const matchStage: any = { year: queryYear };
    if (regencyCode) {
      matchStage.regencyCode = regencyCode as string;
    }

    const caseDetails = await DengueCase.find(matchStage)
      .select(
        "provinceName regencyName totalCases totalDeaths maleDeaths femaleDeaths caseFatalityRate month"
      )
      .sort({ totalCases: -1 });

    sendResponse(res, 200, true, "Case details retrieved successfully", {
      caseDetails,
      year: queryYear,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * @desc Get comprehensive dengue data for charts
 * @route GET /api/dengue/chart-data
 */
export const getChartData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { years = 5 } = req.query;

    // Get yearly trends
    const yearlyTrends = await DengueCase.aggregate([
      {
        $group: {
          _id: "$year",
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
          provinceCount: { $addToSet: "$provinceCode" },
        },
      },
      {
        $project: {
          year: "$_id",
          totalCases: 1,
          totalDeaths: 1,
          caseFatalityRate: {
            $cond: {
              if: { $eq: ["$totalCases", 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ["$totalDeaths", "$totalCases"] }, 100],
              },
            },
          },
          affectedProvinces: { $size: "$provinceCount" },
        },
      },
      { $sort: { year: 1 } },
    ]);

    // Get top regencies across all years for pie chart
    const topRegencies = await DengueCase.aggregate([
      {
        $group: {
          _id: {
            regencyCode: "$regencyCode",
            regencyName: "$regencyName",
            provinceName: "$provinceName",
          },
          totalCases: { $sum: "$totalCases" },
          totalDeaths: { $sum: "$totalDeaths" },
        },
      },
      {
        $project: {
          regencyCode: "$_id.regencyCode",
          regencyName: "$_id.regencyName",
          provinceName: "$_id.provinceName",
          totalCases: 1,
          totalDeaths: 1,
          caseFatalityRate: {
            $cond: {
              if: { $eq: ["$totalCases", 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ["$totalDeaths", "$totalCases"] }, 100],
              },
            },
          },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: 10 },
    ]);

    // Get data by year for area chart
    const areaChartData = yearlyTrends.map((trend) => ({
      year: trend.year.toString(),
      cases: trend.totalCases,
      deaths: trend.totalDeaths,
      fatalityRate: trend.caseFatalityRate,
    }));

    // Generate monthly distribution based on yearly data (since we don't have real monthly data)
    const monthlyDistribution = generateMonthlyDistribution(yearlyTrends);

    sendResponse(res, 200, true, "Chart data retrieved successfully", {
      yearlyTrends,
      topRegencies,
      areaChartData,
      monthlyDistribution,
      totalYears: yearlyTrends.length,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

// Helper function to generate monthly distribution
const generateMonthlyDistribution = (yearlyTrends: any[]) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Use the latest year for monthly distribution
  const latestYear = yearlyTrends[yearlyTrends.length - 1];
  const totalCases = latestYear?.totalCases || 0;

  // Dengue seasonal pattern in Indonesia (typically peaks during rainy season)
  const seasonalPattern = [
    0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.1, 0.09, 0.08, 0.07, 0.05,
  ];

  return months.map((month, index) => ({
    month,
    cases: Math.round(totalCases * seasonalPattern[index]),
    deaths: Math.round((latestYear?.totalDeaths || 0) * seasonalPattern[index]),
    fatalityRate: latestYear?.caseFatalityRate || 0,
  }));
};

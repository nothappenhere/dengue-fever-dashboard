// src/services/dengueService.ts
import { api } from "@/lib/axios";

export interface DengueStats {
  summary: {
    totalCases: number;
    totalDeaths: number;
    maleDeaths: number;
    femaleDeaths: number;
    caseFatalityRate: number;
    affectedProvinces: number;
    affectedRegencies: number;
    trends: {
      cases: number;
      deaths: number;
    };
    dataYear: number;
  };
  topProvinces: Array<{
    _id: string;
    totalCases: number;
    totalDeaths: number;
  }>;
}

export interface MonthlyTrend {
  _id: number;
  cases: number;
  deaths: number;
}

export interface ProvinceData {
  provinceName: string;
  provinceCode: string;
  totalCases: number;
  totalDeaths: number;
  maleDeaths: number;
  femaleDeaths: number;
  caseFatalityRate: number;
  affectedRegencies: number;
}

export interface RegencyData {
  regencyCode: string;
  regencyName: string;
  provinceName: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

export interface HighRiskArea {
  regencyCode: string;
  regencyName: string;
  provinceName: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

export interface TrendData {
  year: number;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
  affectedProvinces: number;
}

export interface ChartDataResponse {
  yearlyTrends: TrendData[];
  topRegencies: RegencyData[];
  areaChartData: any[];
  monthlyDistribution: any[];
  totalYears: number;
}

export const dengueService = {
  getStats: async (): Promise<DengueStats> => {
    const response = await api.get("/dengue/stats");
    return response.data.data;
  },

  getCasesByYear: async (year?: number) => {
    const response = await api.get("/dengue/cases-by-year", {
      params: { year },
    });
    return response.data.data;
  },

  getCasesByProvince: async (provinceCode?: string, year?: number) => {
    const response = await api.get("/dengue/cases-by-province", {
      params: { provinceCode, year, view: "province" },
    });
    return response.data.data;
  },

  getCasesByRegency: async (year?: number) => {
    const response = await api.get("/dengue/cases-by-province", {
      params: { year, view: "regency" },
    });
    return response.data.data;
  },

  getTrends: async (years: number = 5) => {
    const response = await api.get("/dengue/trends", {
      params: { years },
    });
    return response.data.data;
  },

  getHighRiskAreas: async (limit: number = 10, year?: number) => {
    const response = await api.get("/dengue/high-risk-areas", {
      params: { limit, year },
    });
    return response.data.data;
  },

  getCaseDetails: async (regencyCode?: string, year?: number) => {
    const response = await api.get("/dengue/case-details", {
      params: { regencyCode, year },
    });
    return response.data.data;
  },

  getChartData: async (): Promise<ChartDataResponse> => {
    const response = await api.get("/dengue/chart-data");
    return response.data.data;
  },
};
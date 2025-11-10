// src/hooks/useDengueData.ts
import { useState, useEffect } from "react";
import { dengueService } from "@/services/dengueService";
import type { 
  DengueStats, 
  ProvinceData, 
  HighRiskArea,
  MonthlyTrend 
} from "@/services/dengueService";

// Interface definitions
export interface TrendData {
  year: number;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
  affectedProvinces: number;
}

export interface RegencyData {
  regencyCode: string;
  regencyName: string;
  provinceName: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

export interface MonthlyData {
  month: string;
  cases: number;
  deaths: number;
  fatalityRate: number;
}

export const useDengueStats = () => {
  const [stats, setStats] = useState<DengueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dengueService.getStats();
        setStats(data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch stats";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const useDengueTrends = (years: number) => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dengueService.getTrends(years);
        setTrends(data.trends || []);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch trends";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [years]);

  return { trends, loading, error };
};

export const useDengueCasesByProvince = (year?: number) => {
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [dataYear, setDataYear] = useState<number>(
    year || new Date().getFullYear()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dengueService.getCasesByProvince(undefined, year);
        setProvinceData(data.provinceData || []);
        setDataYear(data.dataYear || year || new Date().getFullYear());
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch province data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceData();
  }, [year]);

  return { provinceData, dataYear, loading, error };
};

export const useDengueCasesByRegency = (year?: number) => {
  const [regencyData, setRegencyData] = useState<RegencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegencyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // FIXED: Use consistent service call
        const data = await dengueService.getCasesByRegency(year);
        setRegencyData(data.regencyData || []);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch regency data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRegencyData();
  }, [year]);

  return { regencyData, loading, error };
};

export const useHighRiskAreas = (limit: number = 10, year?: number) => {
  const [highRiskAreas, setHighRiskAreas] = useState<HighRiskArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighRiskAreas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dengueService.getHighRiskAreas(limit, year);
        setHighRiskAreas(data.highRiskAreas || []);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch high risk areas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHighRiskAreas();
  }, [limit, year]);

  return { highRiskAreas, loading, error };
};

export const useMonthlyData = (year?: number) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dengueService.getCasesByYear(year);

        if (data.monthlyTrend && data.monthlyTrend.length > 0) {
          const formattedData: MonthlyData[] = data.monthlyTrend.map((item: any) => ({
            month: getMonthName(item._id),
            cases: item.cases,
            deaths: item.deaths,
            fatalityRate: item.cases > 0 ? (item.deaths / item.cases) * 100 : 0,
          }));
          setMonthlyData(formattedData);
        } else {
          const monthlySample = generateMonthlyData(data.cases || []);
          setMonthlyData(monthlySample);
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch monthly data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [year]);

  return { monthlyData, loading, error };
};

// Helper functions
const getMonthName = (monthNumber: number): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthNumber - 1] || "Unknown";
};

const generateMonthlyData = (cases: any[]): MonthlyData[] => {
  const totalCases = cases.reduce((sum, item) => sum + item.totalCases, 0);
  const totalDeaths = cases.reduce((sum, item) => sum + item.totalDeaths, 0);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return months.map((month, index) => {
    const seasonalFactor = getSeasonalFactor(index);
    const monthlyCases = Math.floor((totalCases * seasonalFactor) / 12);
    const monthlyDeaths = Math.floor((totalDeaths * seasonalFactor) / 12);

    return {
      month,
      cases: monthlyCases,
      deaths: monthlyDeaths,
      fatalityRate: monthlyCases > 0 ? (monthlyDeaths / monthlyCases) * 100 : 0,
    };
  });
};

const getSeasonalFactor = (monthIndex: number) => {
  const seasonalPattern = [
    0.8, 0.9, 1.1, 1.3, 1.5, 1.4, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7,
  ];
  return seasonalPattern[monthIndex] || 1;
};
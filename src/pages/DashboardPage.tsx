import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { DengueAreaChart } from "@/components/charts/DengueAreaChart";
import { DengueBarChart } from "@/components/charts/DengueBarChart";
import { DengueLineChart } from "@/components/charts/DengueLineChart";
import { DenguePieChart } from "@/components/charts/DenguePieChart";
import { DengueRadarChart } from "@/components/charts/DengueRadarChart";
import { DengueRadialChart } from "@/components/charts/DengueRadialChart";
import { useDengueStats } from "@/hooks/useDengueData";
import { StatCard } from "@/components/StatCard";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats, loading, error } = useDengueStats();

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Use real data from API
  const dashboardStats = {
    totalCases: stats?.summary?.totalCases || 0,
    totalDeaths: stats?.summary?.totalDeaths || 0,
    caseFatalityRate: stats?.summary?.caseFatalityRate || 0,
    activeCases: Math.floor((stats?.summary?.totalCases || 0) * 0.125), // Estimate active cases as 12.5% of total
  };

  const caseTrend = stats?.summary?.trends?.cases || 0;
  const deathTrend = stats?.summary?.trends?.deaths || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dengue Fever Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoring and visualization of dengue cases
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back,
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user.fullName}
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title="Total Cases"
            icon={Users}
            value={dashboardStats.totalCases.toLocaleString()}
            trend={caseTrend}
            trendText="from last year"
          />
          <StatCard
            title="Total Deaths"
            icon={AlertTriangle}
            value={dashboardStats.totalDeaths.toLocaleString()}
            subtext={`Case Fatality Rate: ${dashboardStats.caseFatalityRate}%`}
          />
          <StatCard
            title="Active Cases"
            icon={Activity}
            value={dashboardStats.activeCases.toLocaleString()}
            subtext="Currently under treatment"
          />
          <StatCard
            title="Trend Cases"
            icon={TrendingUp}
            value={`${caseTrend <= 0 ? "↓" : "↑"} ${Math.abs(caseTrend)}%`}
            subtext={`${
              caseTrend <= 0 ? "Decreasing" : "Increasing"
            } compared to last year`}
          />
          <StatCard
            title="Death Trend"
            icon={TrendingUp}
            value={`${deathTrend <= 0 ? "↓" : "↑"} ${Math.abs(deathTrend)}%`}
            subtext={`${
              deathTrend <= 0 ? "Decreasing" : "Increasing"
            } compared to last year`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Area Chart - Cases Over Time */}
          <DengueAreaChart />

          {/* Bar Chart - Cases by Province */}
          <DengueBarChart />

          {/* Line Chart - Deaths Trend */}
          {/* <DengueLineChart /> */}

          {/* Pie Chart - Gender Distribution */}
          <DenguePieChart />

          {/* Radar Chart - Regional Comparison */}
          {/* <DengueRadarChart /> */}

          {/* Radial Chart - Age Group Distribution */}
          <DengueRadialChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

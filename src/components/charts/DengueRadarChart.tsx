// src/components/charts/DengueRadarChart.tsx
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDengueCasesByProvince } from "@/hooks/useDengueData";

const chartConfig = {
  totalCases: {
    label: "Total Cases",
    color: "hsl(var(--chart-1))",
  },
  totalDeaths: {
    label: "Total Deaths",
    color: "hsl(var(--chart-2))",
  },
  caseFatalityRate: {
    label: "Fatality Rate %",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface RadarData {
  region: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
  normalizedCases: number;
  normalizedDeaths: number;
}

export function DengueRadarChart() {
  const { provinceData, loading, error } = useDengueCasesByProvince();

  if (loading) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>Provincial Analysis</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>Provincial Analysis</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Take top 6 provinces for radar chart
  const topProvinces = provinceData.slice(0, 6);
  
  // Normalize data for better radar chart visualization
  const maxCases = Math.max(...topProvinces.map(p => p.totalCases));
  const maxDeaths = Math.max(...topProvinces.map(p => p.totalDeaths));
  const maxFatalityRate = Math.max(...topProvinces.map(p => p.caseFatalityRate));

  const radarData: RadarData[] = topProvinces.map((province) => ({
    region:
      province.provinceName.length > 12
        ? province.provinceName.substring(0, 12) + "..."
        : province.provinceName,
    totalCases: province.totalCases,
    totalDeaths: province.totalDeaths,
    caseFatalityRate: province.caseFatalityRate,
    normalizedCases: maxCases > 0 ? (province.totalCases / maxCases) * 100 : 0,
    normalizedDeaths: maxDeaths > 0 ? (province.totalDeaths / maxDeaths) * 100 : 0,
  }));

  // Find province with highest cases for the footer
  const highestCasesProvince = topProvinces.length > 0
    ? topProvinces.reduce((prev, current) =>
        prev.totalCases > current.totalCases ? prev : current
      )
    : null;

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Provincial Analysis</CardTitle>
        <CardDescription>
          Dengue impact across different provinces (Normalized scale)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart
            data={radarData}
            margin={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis 
              dataKey="region" 
              tick={{ fontSize: 11 }}
            />
            <PolarGrid />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tickCount={6}
            />
            <Radar
              name="Total Cases"
              dataKey="normalizedCases"
              stroke="var(--color-totalCases)"
              fill="var(--color-totalCases)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Total Deaths"
              dataKey="normalizedDeaths"
              stroke="var(--color-totalDeaths)"
              fill="var(--color-totalDeaths)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <ChartLegend className="mt-4" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {highestCasesProvince ? (
            <>
              Highest cases in {highestCasesProvince.provinceName}{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            "No data available"
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Data normalized to 0-100 scale for comparison
        </div>
      </CardFooter>
    </Card>
  );
}
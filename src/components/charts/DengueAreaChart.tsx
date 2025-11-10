// src/components/charts/DengueAreaChart.tsx
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useDengueTrends } from "@/hooks/useDengueData";

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

interface TrendData {
  year: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

export function DengueAreaChart() {
  const { trends, loading, error } = useDengueTrends(10);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dengue Cases Trend</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dengue Cases Trend</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData: TrendData[] = trends.map((trend) => ({
    year: trend.year.toString(),
    totalCases: trend.totalCases,
    totalDeaths: trend.totalDeaths,
    caseFatalityRate: trend.caseFatalityRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dengue Cases Trend (10 Years)</CardTitle>
        <CardDescription>
          Yearly dengue cases, deaths, and fatality rates
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-totalCases)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-totalCases)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillDeaths" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-totalDeaths)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-totalDeaths)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />

            <ChartTooltip 
              cursor={{ stroke: 'var(--color-totalCases)', strokeWidth: 1 }}
              content={<ChartTooltipContent />} 
            />

            {/* FIXED: Remove stackId for proper overlapping */}
            <Area
              dataKey="totalCases"
              type="monotone"
              fill="url(#fillCases)"
              stroke="var(--color-totalCases)"
              strokeWidth={2}
              fillOpacity={0.6}
            />
            <Area
              dataKey="totalDeaths"
              type="monotone"
              fill="url(#fillDeaths)"
              stroke="var(--color-totalDeaths)"
              strokeWidth={2}
              fillOpacity={0.6}
            />
            
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
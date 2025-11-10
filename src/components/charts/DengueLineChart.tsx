import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

export function DengueLineChart() {
  const { trends, loading, error } = useDengueTrends(10);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalCases");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yearly Trends</CardTitle>
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
          <CardTitle>Yearly Trends</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for line chart
  const chartData = trends.map((trend) => ({
    year: trend.year.toString(),
    totalCases: trend.totalCases,
    totalDeaths: trend.totalDeaths,
    caseFatalityRate: trend.caseFatalityRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Trends (10 Years)</CardTitle>
        <CardDescription>
          Yearly dengue cases, deaths, and fatality rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={chartData}>
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="year"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={{
                fill: `var(--color-${activeChart})`,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="flex gap-4 mt-4">
          {Object.entries(chartConfig).map(([key, config]) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted data-[active=true]:text-foreground text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-1 text-sm transition-colors"
              onClick={() => setActiveChart(key as keyof typeof chartConfig)}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(--color-${key})` }}
              />
              {config.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

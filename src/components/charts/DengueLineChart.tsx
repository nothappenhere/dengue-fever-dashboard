"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDengueTrends } from "@/hooks/useDengueData";

const chartConfig = {
  // totalCases: {
  //   label: "Total Cases",
  //   color: "hsl(var(--chart-1))",
  // },
  // totalDeaths: {
  //   label: "Total Deaths",
  //   color: "hsl(var(--chart-2))",
  // },
  maleDeaths: {
    label: "Male Deaths",
    color: "hsl(var(--chart-3))",
  },
  femaleDeaths: {
    label: "Female Deaths",
    color: "hsl(var(--chart-4))",
  },
  caseFatalityRate: {
    label: "Fatality Rate %",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function DengueLineChart() {
  const [selectedYears, setSelectedYears] = React.useState(10);
  const { trends, loading, error } = useDengueTrends(selectedYears);

  const [activeCharts, setActiveCharts] = React.useState<
    (keyof typeof chartConfig)[]
  >(["maleDeaths", "femaleDeaths"]);

  if (loading)
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

  if (error)
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

  const chartData = trends.map((trend) => ({
    year: trend.year.toString(),
    // totalCases: trend.totalCases,
    // totalDeaths: trend.totalDeaths,
    maleDeaths: trend.maleDeaths,
    femaleDeaths: trend.femaleDeaths,
    caseFatalityRate: trend.caseFatalityRate,
  }));

  const toggleChart = (key: keyof typeof chartConfig) => {
    setActiveCharts((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>
            Yearly Dengue Trends ({selectedYears} Years) - Line Chart
          </CardTitle>
          <CardDescription>
            Showing male/female breakdown, and fatality rates for the last{" "}
            {selectedYears} year
          </CardDescription>
        </div>

        {/* Dropdown tahun */}
        <Select
          value={selectedYears.toString()}
          onValueChange={(value) => setSelectedYears(Number(value))}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select year range"
          >
            <SelectValue placeholder="Select year range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="5">Last 5 years</SelectItem>
            <SelectItem value="10">Last 10 years</SelectItem>
            <SelectItem value="20">Last 20 years</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      {loading ? (
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      ) : error ? (
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      ) : (
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] ">
            <LineChart data={chartData}>
              <CartesianGrid vertical={true} strokeDasharray="3 3" />

              <XAxis
                dataKey="year"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
              />

              {/* Left Y-Axis for counts */}
              <YAxis tickLine={true} axisLine={true} />

              {/* Right Y-Axis for % */}
              <YAxis
                orientation="right"
                tickLine={true}
                axisLine={true}
                tickFormatter={(val) => `${val}%`}
              />

              <ChartTooltip
                cursor={{ stroke: "var(--color-totalCases)", strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="dot" />}
              />

              {activeCharts.map((key) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={chartConfig[key].color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>

          {/* Legend / toggle buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {Object.entries(chartConfig).map(([key, config]) => {
              const chartKey = key as keyof typeof chartConfig;
              const isActive = activeCharts.includes(chartKey);
              return (
                <button
                  key={key}
                  onClick={() => toggleChart(chartKey)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm transition-colors
                  ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

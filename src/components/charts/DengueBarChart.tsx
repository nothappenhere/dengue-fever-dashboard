// src/components/charts/DengueBarChart.tsx
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { useDengueCasesByRegency } from "@/hooks/useDengueData";

const chartConfig = {
  totalCases: {
    label: "Total Cases",
    color: "hsl(var(--chart-1))",
  },
  totalDeaths: {
    label: "Total Deaths",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface RegencyData {
  regencyName: string;
  totalCases: number;
  totalDeaths: number;
  provinceName: string;
}

export function DengueBarChart() {
  const { regencyData, loading, error } = useDengueCasesByRegency(2024);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalCases");

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6">
            <CardTitle>Cases by Regency/City</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6">
            <CardTitle>Cases by Regency/City</CardTitle>
            <CardDescription>Error loading data</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Use regency data instead of province data
  const chartData: RegencyData[] = regencyData.slice(0, 10); // Top 10 regencies

  const total = chartData.reduce(
    (acc, curr) => ({
      totalCases: acc.totalCases + curr.totalCases,
      totalDeaths: acc.totalDeaths + curr.totalDeaths,
    }),
    { totalCases: 0, totalDeaths: 0 }
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6">
          <CardTitle>Cases by Regency/City</CardTitle>
          <CardDescription>
            Top 10 regencies/cities with highest dengue cases
          </CardDescription>
        </div>
        <div className="flex">
          {Object.entries(chartConfig).map(([key, config]) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {config.label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-xl">
                  {total[chart].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="regencyName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={<ChartTooltipContent labelKey="regencyName" />}
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
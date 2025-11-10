import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [selectedYears, setSelectedYears] = React.useState(10);
  const { trends, loading, error } = useDengueTrends(selectedYears);

  // Transform data for the chart
  const chartData: TrendData[] = trends.map((trend) => ({
    year: trend.year.toString(),
    totalCases: trend.totalCases,
    totalDeaths: trend.totalDeaths,
    caseFatalityRate: trend.caseFatalityRate,
  }));

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Dengue Cases Trend - Area Chart</CardTitle>
          <CardDescription>
            Showing total yearly dengue cases for the last {selectedYears} year
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
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full md:w-none"
          >
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

              <CartesianGrid vertical={true} strokeDasharray="3 3" />

              <XAxis
                dataKey="year"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
              />
              <YAxis tickLine={true} axisLine={true} tickMargin={8} />

              <ChartTooltip
                cursor={{ stroke: "var(--color-totalCases)", strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="dot" />}
              />

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
      )}
    </Card>
  );
}

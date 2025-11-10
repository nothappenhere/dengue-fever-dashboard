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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  // dropdown tahun
  const currentYear = new Date().getFullYear() - 1;
  const [selectedYear, setSelectedYear] = React.useState(currentYear);

  // Hook custom untuk ambil data
  const { regencyData, loading, error } = useDengueCasesByRegency(selectedYear);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalCases");

  // Ambil 10 besar kabupaten/kota
  const chartData: RegencyData[] = regencyData.slice(0, 10);

  // Hitung total kasus dan kematian
  const total = chartData.reduce(
    (acc, curr) => ({
      totalCases: acc.totalCases + curr.totalCases,
      totalDeaths: acc.totalDeaths + curr.totalDeaths,
    }),
    { totalCases: 0, totalDeaths: 0 }
  );

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Cases by Regency/City - Bar Chart</CardTitle>
          <CardDescription>
            Top 10 regencies/cities with highest dengue cases in {selectedYear}
          </CardDescription>
        </div>

        {/* Dropdown tahun */}
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
          <SelectTrigger
            className="hidden w-[130px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select year"
          >
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="2014">2014</SelectItem>
            <SelectItem value="2015">2015</SelectItem>
            <SelectItem value="2016">2016</SelectItem>
            <SelectItem value="2017">2017</SelectItem>
            <SelectItem value="2018">2018</SelectItem>
            <SelectItem value="2019">2019</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
            <SelectItem value="2021">2021</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
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
        <CardContent className="p-6">
          <div className="flex justify-end mb-4 gap-2">
            {/* Tombol toggle antara totalCases & totalDeaths */}
            {Object.entries(chartConfig).map(([key, config]) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    activeChart === chart
                      ? "bg-muted/60 border-muted-foreground"
                      : "hover:bg-muted/30 border-transparent"
                  }`}
                  onClick={() => setActiveChart(chart)}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={true} strokeDasharray="3 3" />

              <XAxis
                dataKey="regencyName"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tickLine={true} axisLine={true} tickMargin={8} />

              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.8)" }}
                content={
                  <ChartTooltipContent labelKey="regencyName" indicator="dot" />
                }
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
      )}
    </Card>
  );
}

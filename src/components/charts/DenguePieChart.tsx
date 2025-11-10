// src/components/charts/DenguePieChart.tsx
import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
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
  ChartStyle,
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
import { useDengueCasesByProvince } from "@/hooks/useDengueData";

// Color palette for provinces
const provinceColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface ProvinceData {
  provinceName: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

// Dynamic chart config based on data
const getChartConfig = (provinces: ProvinceData[]) => {
  const config: any = {
    cases: {
      label: "Total Cases",
    }
  };
  
  provinces.forEach((province, index) => {
    config[`province-${index + 1}`] = {
      label: province.provinceName,
      color: provinceColors[index] || provinceColors[0],
    };
  });
  
  return config;
};

export function DenguePieChart() {
  const { provinceData, loading, error } = useDengueCasesByProvince();
  
  // Take top 5 provinces for pie chart
  const topProvinces = provinceData.slice(0, 5).map((province, index) => ({
    ...province,
    fill: provinceColors[index] || provinceColors[0],
    colorKey: `province-${index + 1}` as const,
  }));

  const id = "pie-dengue";
  const chartConfig = React.useMemo(() => getChartConfig(topProvinces), [topProvinces]);

  const [activeProvince, setActiveProvince] = React.useState(
    topProvinces[0]?.provinceName || ""
  );

  const activeIndex = React.useMemo(
    () => topProvinces.findIndex((item) => item.provinceName === activeProvince),
    [activeProvince, topProvinces]
  );

  const provinces = React.useMemo(
    () => topProvinces.map((item) => item.provinceName),
    [topProvinces]
  );

  const totalCases = topProvinces.reduce(
    (sum, item) => sum + item.totalCases,
    0
  );

  // Data untuk pie chart dengan active state
  const pieData = topProvinces.map((item, index) => ({
    ...item,
    isActive: index === activeIndex,
  }));

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Cases by Province</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || topProvinces.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Cases by Province</CardTitle>
          <CardDescription>
            {error ? "Error loading data" : "No data available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <div className="text-muted-foreground">
            {error ? `Error: ${error}` : "No province data to display"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Cases by Province - Pie Chart</CardTitle>
          <CardDescription>Distribution across top 5 provinces</CardDescription>
        </div>
        <Select value={activeProvince} onValueChange={setActiveProvince}>
          <SelectTrigger
            className="ml-auto h-7 w-[140px] rounded-lg pl-2.5"
            aria-label="Select a province"
          >
            <SelectValue placeholder="Select province" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {provinces.map((province, index) => {
              const color = provinceColors[index] || provinceColors[0];
              return (
                <SelectItem
                  key={province}
                  value={province}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{ backgroundColor: color }}
                    />
                    {province}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={pieData}
              dataKey="totalCases"
              nameKey="provinceName"
              innerRadius={60}
              strokeWidth={2}
              startAngle={90}
              endAngle={450}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke="var(--background)"
                  strokeWidth={entry.isActive ? 4 : 2}
                  style={{
                    filter: entry.isActive
                      ? "drop-shadow(0 0 8px rgba(0,0,0,0.3))"
                      : "none",
                    transform: entry.isActive ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox && topProvinces[activeIndex]) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {topProvinces[activeIndex].totalCases.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Cases
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 42}
                          className="fill-muted-foreground text-xs"
                        >
                          {(
                            (topProvinces[activeIndex].totalCases / totalCases) *
                            100
                          ).toFixed(1)}
                          %
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
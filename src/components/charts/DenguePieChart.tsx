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

// 🌈 Palet warna epidemi (lebih lembut & informatif)
const provinceColors = [
  "#e63946", // merah
  "#f3722c", // oranye
  "#f9c74f", // kuning
  "#90be6d", // hijau
  "#43aa8b", // biru-hijau
];

interface ProvinceData {
  provinceName: string;
  totalCases: number;
  totalDeaths: number;
  caseFatalityRate: number;
}

const getChartConfig = (provinces: ProvinceData[]) => {
  const config: any = { cases: { label: "Total Cases" } };
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
  const topProvinces = provinceData.slice(0, 5).map((province, index) => ({
    ...province,
    fill: provinceColors[index] || provinceColors[0],
    colorKey: `province-${index + 1}` as const,
  }));

  const id = "pie-dengue";
  const chartConfig = React.useMemo(
    () => getChartConfig(topProvinces),
    [topProvinces]
  );
  const [activeProvince, setActiveProvince] = React.useState(
    topProvinces[0]?.provinceName || ""
  );

  React.useEffect(() => {
    if (topProvinces.length > 0 && !activeProvince) {
      setActiveProvince(topProvinces[0].provinceName);
    }
  }, [topProvinces, activeProvince]);

  const activeIndex = React.useMemo(
    () =>
      topProvinces.findIndex((item) => item.provinceName === activeProvince),
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
  const pieData = topProvinces.map((item, index) => ({
    ...item,
    isActive: index === activeIndex,
  }));

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm mt-2 text-muted-foreground">Loading data...</p>
      </Card>
    );
  }

  if (error || topProvinces.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-muted-foreground">
          {error ? `Error: ${error}` : "No province data to display"}
        </p>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col shadow-lg rounded-2xl">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle> DBD Cases by Province - Pie Chart</CardTitle>
          <CardDescription>
            Top 5 provinces with highest dengue cases
          </CardDescription>
        </div>

        {/* Dropdown Provinsi */}
        <Select value={activeProvince} onValueChange={setActiveProvince}>
          <SelectTrigger
            className="hidden w-[130px] rounded-lg sm:ml-auto sm:flex"
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
                  className="rounded-lg"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="h-3 w-3 rounded-sm"
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

      <CardContent className="flex justify-center pb-2">
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
              innerRadius={65}
              outerRadius={110}
              strokeWidth={2}
              startAngle={90}
              endAngle={450}
            >
              <defs>
                {provinceColors.map((color, i) => (
                  <linearGradient
                    id={`grad-${i}`}
                    key={i}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={1} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.9} />
                  </linearGradient>
                ))}
              </defs>

              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#grad-${index}) ${entry.fill}`}
                  stroke="#001E2B"
                  strokeWidth={entry.isActive ? 2 : 1}
                  style={{
                    filter: entry.isActive
                      ? `drop-shadow(0 0 10px ${entry.fill}90)`
                      : "none",
                    transform: entry.isActive ? "scale(1.06)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
              {/* Gradient untuk tiap slice */}
              <defs>
                {provinceColors.map((color, i) => (
                  <linearGradient
                    id={`grad-${i}`}
                    key={i}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={1} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.9} />
                  </linearGradient>
                ))}
              </defs>

              {/* Label tengah */}
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    "cx" in viewBox &&
                    "cy" in viewBox &&
                    topProvinces[activeIndex]
                  ) {
                    const activeColor = topProvinces[activeIndex].fill;
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
                          className="text-3xl font-bold"
                          fill={activeColor}
                        >
                          {topProvinces[
                            activeIndex
                          ].totalCases.toLocaleString()}
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
                            (topProvinces[activeIndex].totalCases /
                              totalCases) *
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

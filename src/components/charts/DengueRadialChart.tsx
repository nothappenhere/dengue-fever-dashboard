import { TrendingUp } from "lucide-react";
import { Label, LabelList, RadialBar, RadialBarChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useHighRiskAreas } from "@/hooks/useDengueData";
import { motion } from "framer-motion";

// 🎨 Warna berdasarkan level risiko (gradasi)
const riskAreaColors = [
  "#ff4d4f", // Risk 1 - Merah (sangat tinggi)
  "#ff7a45", // Risk 2 - Oranye
  "#ffa940", // Risk 3 - Kuning-oranye
  "#ffc53d", // Risk 4 - Kuning
  "#36cfc9", // Risk 5 - Biru kehijauan
];

const chartConfig = {
  totalCases: { label: "Total Cases" },
} satisfies ChartConfig;

export function DengueRadialChart() {
  const { highRiskAreas, loading, error } = useHighRiskAreas(5);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm mt-2 text-muted-foreground">Loading data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-red-500 font-medium">Error loading data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  const radialData = highRiskAreas.slice(0, 5).map((area, index) => ({
    areaName:
      area.regencyName.length > 12
        ? area.regencyName.substring(0, 12) + "..."
        : area.regencyName,
    totalCases: area.totalCases,
    fill: riskAreaColors[index] || "#999",
    province: area.provinceName,
  }));

  const highestRiskArea =
    highRiskAreas.length > 0
      ? highRiskAreas.reduce((prev, current) =>
          prev.totalCases > current.totalCases ? prev : current
        )
      : null;

  const totalSum = radialData.reduce((sum, item) => sum + item.totalCases, 0);

  return (
    <Card className="flex flex-col shadow-lg rounded-2xl">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg font-bold">High Risk Areas</CardTitle>
        <CardDescription>Top 5 regions with highest DBD cases</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <RadialBarChart
              data={radialData}
              startAngle={90}
              endAngle={450}
              innerRadius="20%"
              outerRadius="90%"
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="areaName" />}
              />
              <RadialBar
                dataKey="totalCases"
                background={{ fill: "#f3f4f6" }}
                cornerRadius={10}
              >
                <LabelList
                  position="insideStart"
                  dataKey="areaName"
                  className="fill-white font-semibold"
                  fontSize={11}
                />
              </RadialBar>

              {/* Label tengah untuk total */}
              <Label
                position="center"
                content={() => (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-800 font-bold"
                  >
                    {totalSum.toLocaleString()} Cases
                  </text>
                )}
              />
            </RadialBarChart>
          </ChartContainer>
        </motion.div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-center">
        <div className="flex items-center justify-center gap-2 font-medium">
          {highestRiskArea ? (
            <>
              Highest risk:{" "}
              <span className="text-red-600 font-semibold">
                {highestRiskArea.regencyName}
              </span>{" "}
              <TrendingUp className="h-4 w-4 text-red-500" />
            </>
          ) : (
            "No high risk data"
          )}
        </div>
        <div className="text-muted-foreground text-xs">
          Data based on total dengue cases (latest year)
        </div>
      </CardFooter>
    </Card>
  );
}

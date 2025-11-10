import { TrendingUp } from "lucide-react";
import { LabelList, RadialBar, RadialBarChart } from "recharts";
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

// Color palette for high risk areas
const riskAreaColors = [
  "var(--color-risk-1)",
  "var(--color-risk-2)",
  "var(--color-risk-3)",
  "var(--color-risk-4)",
  "var(--color-risk-5)",
];

const chartConfig = {
  totalCases: {
    label: "Total Cases",
  },
  "risk-1": {
    label: "High Risk Area 1",
    color: "hsl(var(--chart-1))",
  },
  "risk-2": {
    label: "High Risk Area 2",
    color: "hsl(var(--chart-2))",
  },
  "risk-3": {
    label: "High Risk Area 3",
    color: "hsl(var(--chart-3))",
  },
  "risk-4": {
    label: "High Risk Area 4",
    color: "hsl(var(--chart-4))",
  },
  "risk-5": {
    label: "High Risk Area 5",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function DengueRadialChart() {
  const { highRiskAreas, loading, error } = useHighRiskAreas(5);

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>High Risk Areas - Radial Chart</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>High Risk Areas</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for radial chart
  const radialData = highRiskAreas.slice(0, 5).map((area, index) => ({
    areaName:
      area.regencyName.length > 10
        ? area.regencyName.substring(0, 10) + "..."
        : area.regencyName,
    totalCases: area.totalCases,
    fill: riskAreaColors[index] || riskAreaColors[0],
    province: area.provinceName,
  }));

  // Find area with highest cases for the footer
  const highestRiskArea =
    highRiskAreas.length > 0
      ? highRiskAreas.reduce((prev, current) =>
          prev.totalCases > current.totalCases ? prev : current
        )
      : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>High Risk Areas</CardTitle>
        <CardDescription>Top 5 high risk regencies/cities</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={radialData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="areaName" />}
            />
            <RadialBar dataKey="totalCases" background>
              <LabelList
                position="insideStart"
                dataKey="areaName"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {highestRiskArea ? (
            <>
              Highest risk in {highestRiskArea.regencyName}{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            "No high risk areas data"
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Based on total case numbers
        </div>
      </CardFooter>
    </Card>
  );
}

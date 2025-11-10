import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  icon?: LucideIcon;
  value: string | number;
  subtext?: string;
  trend?: number;
  trendText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon: Icon,
  value,
  subtext,
  trend,
  trendText,
}) => {
  const trendColor =
    trend === undefined
      ? "text-muted-foreground"
      : trend >= 0
      ? "text-red-600"
      : "text-green-600";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined ? (
          <p className={`text-xs ${trendColor}`}>
            {trend >= 0 ? "+" : ""}
            {trend}% {trendText || ""}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
};

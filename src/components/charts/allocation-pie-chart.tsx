"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface AllocationPieChartProps {
  data: CategoryData[];
  currency: CurrencyCode;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryData }>;
  currency: CurrencyCode;
  total: number;
}

const CustomTooltip = ({ active, payload, currency, total }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? (data.value / total) * 100 : 0;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(data.value, currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPercentage(percent, 0)} of total
        </p>
      </div>
    );
  }
  return null;
};

export function AllocationPieChart({ data, currency }: AllocationPieChartProps) {
  // Filter out zero values
  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No allocations to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container */}
        <div className="h-44 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip currency={currency} total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend below chart */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {filteredData.map((entry) => {
            const percent = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs sm:text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-foreground">{entry.name}</span>
                <span className="text-muted-foreground">
                  ({formatPercentage(percent, 0)})
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";

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

const CustomTooltip = ({
  active,
  payload,
  currency,
  total,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? (data.value / total) * 100 : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <p className="font-medium">{data.name}</p>
        </div>
        <p className="text-lg font-mono font-semibold tabular-nums">
          {formatCurrency(data.value, currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPercentage(percent, 1)} of total
        </p>
      </motion.div>
    );
  }
  return null;
};

export function AllocationPieChart({
  data,
  currency,
}: AllocationPieChartProps) {
  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  if (filteredData.length === 0) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted">
              <PieChartIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg font-serif font-normal">
              Distribution
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-muted mb-4" />
            <p className="text-sm">No allocations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <PieChartIcon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-serif font-normal">
            Distribution
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart container */}
        <div className="h-48 sm:h-52 relative">
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total
              </p>
              <p className="text-xl font-mono font-semibold tabular-nums">
                {formatCurrency(total, currency)}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip currency={currency} total={total} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {filteredData.slice(0, 6).map((entry) => {
            const percent = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatPercentage(percent, 0)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

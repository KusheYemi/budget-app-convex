"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface AllocationBarChartProps {
  data: CategoryData[];
  currency: CurrencyCode;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryData }>;
  label?: string;
  currency: CurrencyCode;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <p className="font-medium">{label}</p>
        </div>
        <p className="text-lg font-mono font-semibold tabular-nums">
          {formatCurrency(payload[0].value, currency)}
        </p>
      </motion.div>
    );
  }
  return null;
};

export function AllocationBarChart({
  data,
  currency,
}: AllocationBarChartProps) {
  const filteredData = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (filteredData.length === 0) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg font-serif font-normal">
              Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <div className="flex gap-1 mb-4">
              {[40, 60, 30, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-6 bg-muted rounded-t"
                  style={{ height: h / 2 }}
                />
              ))}
            </div>
            <p className="text-sm">No allocations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...filteredData.map((d) => d.value));

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-serif font-normal">
            Breakdown
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-52 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[0, maxValue * 1.1]}
                tickFormatter={(value) => formatCurrency(value, currency)}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11, fill: "var(--color-foreground)" }}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.slice(0, 9)}...` : value
                }
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                maxBarSize={32}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

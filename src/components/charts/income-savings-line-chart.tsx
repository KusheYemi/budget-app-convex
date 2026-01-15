"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";

interface MonthlyData {
  year: number;
  month: number;
  income: number;
  savingsAmount: number;
}

interface IncomeSavingsLineChartProps {
  data: MonthlyData[];
  currency: CurrencyCode;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
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
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function IncomeSavingsLineChart({
  data,
  currency,
}: IncomeSavingsLineChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income vs Savings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: formatMonth(d.year, d.month),
    income: d.income,
    savings: d.savingsAmount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Income vs Savings Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 sm:h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9 }}
                angle={-45}
                textAnchor="end"
                height={50}
                tickFormatter={(value) => {
                  // Shorten month names on mobile (e.g., "Jan 2024" instead of "January 2024")
                  const parts = value.split(" ");
                  if (parts.length === 2) {
                    return `${parts[0].slice(0, 3)} ${parts[1].slice(2)}`;
                  }
                  return value;
                }}
              />
              <YAxis
                tickFormatter={(value) => {
                  // Shorten currency display
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
                tick={{ fontSize: 9 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend
                verticalAlign="top"
                height={30}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

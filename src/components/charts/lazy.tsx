"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Chart loading skeleton components
function PieChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-44 sm:h-48 flex items-center justify-center">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 flex items-end justify-around gap-2 pt-4">
          {[60, 80, 45, 90, 35, 70].map((h, i) => (
            <Skeleton key={i} className="w-8 sm:w-12" style={{ height: `${h}%` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Income & Savings Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-center gap-4 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Lazy-loaded chart components
export const LazyAllocationPieChart = dynamic(
  () => import("./allocation-pie-chart").then((mod) => mod.AllocationPieChart),
  {
    loading: () => <PieChartSkeleton />,
    ssr: false,
  }
);

export const LazyAllocationBarChart = dynamic(
  () => import("./allocation-bar-chart").then((mod) => mod.AllocationBarChart),
  {
    loading: () => <BarChartSkeleton />,
    ssr: false,
  }
);

export const LazyIncomeSavingsLineChart = dynamic(
  () => import("./income-savings-line-chart").then((mod) => mod.IncomeSavingsLineChart),
  {
    loading: () => <LineChartSkeleton />,
    ssr: false,
  }
);

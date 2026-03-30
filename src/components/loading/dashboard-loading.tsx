import { Skeleton } from "@/components/ui/skeleton";

function SkeletonHeader() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-5 w-20 hidden sm:block" />
        <Skeleton className="h-8 w-44 hidden md:block rounded-full ml-6" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SkeletonHeader />
      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>

        {/* Summary card */}
        <Skeleton className="h-36 w-full rounded-2xl" />

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-3 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}

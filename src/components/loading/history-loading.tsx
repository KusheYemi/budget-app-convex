import { Skeleton } from "@/components/ui/skeleton";

export function HistoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Filter card */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-16" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        {/* Table rows */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

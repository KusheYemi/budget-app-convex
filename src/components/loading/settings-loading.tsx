import { Skeleton } from "@/components/ui/skeleton";

export function SettingsLoading() {
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

      <main className="container py-4 sm:py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Preferences card */}
        <div className="rounded-xl border bg-card p-6 max-w-xl space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        {/* Security card */}
        <div className="rounded-xl border bg-card p-6 max-w-xl space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </main>
    </div>
  );
}

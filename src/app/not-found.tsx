import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
        <div className="p-4 rounded-2xl bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

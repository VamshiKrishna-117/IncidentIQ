import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPage() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-container-low p-4">
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

import { Card } from '@/components/ui/card'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />
}

export default function EventDetailLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-4 w-28" />

      <Card className="mb-4 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-2 h-4 w-40" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
        <Card className="p-5">
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </Card>
    </div>
  )
}

import { Card } from '@/components/ui/card'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ''}`} />
}

export default function SaDashboardLoading() {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-8 w-12" />
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

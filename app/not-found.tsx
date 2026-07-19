import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-muted-foreground">
          404
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This page doesn't exist or has been removed.
        </p>
        <Link href="/" className={buttonVariants()}>
          Go home
        </Link>
      </Card>
    </div>
  )
}

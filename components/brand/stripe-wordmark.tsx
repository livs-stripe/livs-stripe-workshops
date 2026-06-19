import { cn } from '@/lib/utils'
import { PLATFORM_LOCKUP_SHORT } from '@/lib/themes'

/**
 * Stripe wordmark (logotype) from Stripe’s official logo kit (Sept 2025).
 * Source: https://stripe.com/newsroom/information → “Download logo kit”
 * (`Stripe_logo_kit.zip` → `asset-wordmark/`). Marks are subject to Stripe’s
 * Marks Usage Agreement.
 *
 * Variants:
 * - `blurple` — kit “Stripe wordmark - Blurple.svg” (#533AFD), common on light UI.
 * - `foreground` — same geometry as kit slate wordmark, `fill="currentColor"` with
 *   `text-foreground` for strict “slate logotype on light” aligned to your theme.
 * - `white` — kit “Stripe wordmark - White.svg” for dark backgrounds.
 *
 * **Clear space:** follow the spacing guidelines packaged with the logo kit (do not
 * crop tighter than Stripe’s minimum padding around the mark).
 */
export type StripeWordmarkVariant = 'blurple' | 'foreground' | 'white'

export function StripeWordmark({
  className,
  variant = 'blurple',
}: {
  className?: string
  variant?: StripeWordmarkVariant
}) {
  if (variant === 'white') {
    return (
      <svg
        viewBox="0 0 360 151"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Stripe"
        className={cn('h-5 w-auto shrink-0', className)}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M360 78.0002C360 52.4002 347.6 32.2002 323.9 32.2002C300.1 32.2002 285.7 52.4002 285.7 77.8002C285.7 107.9 302.7 123.1 327.1 123.1C339 123.1 348 120.4 354.8 116.6V96.6002C348 100 340.2 102.1 330.3 102.1C320.6 102.1 312 98.7002 310.9 86.9002H359.8C359.8 85.6002 360 80.4002 360 78.0002ZM310.6 68.5002C310.6 57.2002 317.5 52.5002 323.8 52.5002C329.9 52.5002 336.4 57.2002 336.4 68.5002H310.6Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M247.1 32.2002C237.3 32.2002 231 36.8002 227.5 40.0002L226.2 33.8002H204.2V150.4L229.2 145.1L229.3 116.8C232.9 119.4 238.2 123.1 247 123.1C264.9 123.1 281.2 108.7 281.2 77.0002C281.1 48.0002 264.6 32.2002 247.1 32.2002ZM241.1 101.1C235.2 101.1 231.7 99.0002 229.3 96.4002L229.2 59.3002C231.8 56.4002 235.4 54.4002 241.1 54.4002C250.2 54.4002 256.5 64.6002 256.5 77.7002C256.5 91.1002 250.3 101.1 241.1 101.1Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M169.8 26.3001L194.9 20.9001V0.600098L169.8 5.9001V26.3001Z"
          fill="white"
        />
        <path
          d="M194.9 33.9001H169.8V121.4H194.9V33.9001Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M142.9 41.3001L141.3 33.9001H119.7V121.4H144.7V62.1001C150.6 54.4001 160.6 55.8001 163.7 56.9001V33.9001C160.5 32.7001 148.8 30.5001 142.9 41.3001Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M92.8999 12.2002L68.4999 17.4002L68.3999 97.5002C68.3999 112.3 79.4999 123.2 94.2999 123.2C102.5 123.2 108.5 121.7 111.8 119.9V99.6002C108.6 100.9 92.7999 105.5 92.7999 90.7002V55.2002H111.8V33.9002H92.7999L92.8999 12.2002Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.3 59.3002C25.3 55.4002 28.5 53.9002 33.8 53.9002C41.4 53.9002 51 56.2002 58.6 60.3002V36.8002C50.3 33.5002 42.1 32.2002 33.8 32.2002C13.5 32.2002 0 42.8002 0 60.5002C0 88.1002 38 83.7002 38 95.6002C38 100.2 34 101.7 28.4 101.7C20.1 101.7 9.5 98.3002 1.1 93.7002V117.5C10.4 121.5 19.8 123.2 28.4 123.2C49.2 123.2 63.5 112.9 63.5 95.0002C63.4 65.2002 25.3 70.5002 25.3 59.3002Z"
          fill="white"
        />
      </svg>
    )
  }

  if (variant === 'foreground') {
    return (
      <svg
        viewBox="0 0 360 151"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Stripe"
        className={cn('h-5 w-auto shrink-0 text-foreground', className)}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M360 78.2001C360 52.6001 347.6 32.4001 323.9 32.4001C300.1 32.4001 285.7 52.6001 285.7 78.0001C285.7 108.1 302.7 123.3 327.1 123.3C339 123.3 348 120.6 354.8 116.8V96.8001C348 100.2 340.2 102.3 330.3 102.3C320.6 102.3 312 98.9002 310.9 87.1002H359.8C359.8 85.8002 360 80.6002 360 78.2001ZM310.6 68.7001C310.6 57.4002 317.5 52.7001 323.8 52.7001C329.9 52.7001 336.4 57.4002 336.4 68.7001H310.6Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M247.1 32.4001C237.3 32.4001 231 37.0001 227.5 40.2001L226.2 34.0001H204.2V150.6L229.2 145.3L229.3 117C232.9 119.6 238.2 123.3 247 123.3C264.9 123.3 281.2 108.9 281.2 77.2001C281.1 48.2001 264.6 32.4001 247.1 32.4001ZM241.1 101.3C235.2 101.3 231.7 99.2001 229.3 96.6002L229.2 59.5001C231.8 56.6001 235.4 54.6002 241.1 54.6002C250.2 54.6002 256.5 64.8001 256.5 77.9001C256.5 91.3001 250.3 101.3 241.1 101.3Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M169.8 26.5L194.9 21.1V0.800049L169.8 6.10005V26.5Z"
          fill="currentColor"
        />
        <path
          d="M194.9 34.1001H169.8V121.6H194.9V34.1001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M142.9 41.5001L141.3 34.1001H119.7V121.6H144.7V62.3001C150.6 54.6001 160.6 56.0001 163.7 57.1001V34.1001C160.5 32.9001 148.8 30.7001 142.9 41.5001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M92.8999 12.4001L68.4999 17.6001L68.3999 97.7001C68.3999 112.5 79.4999 123.4 94.2999 123.4C102.5 123.4 108.5 121.9 111.8 120.1V99.8001C108.6 101.1 92.7999 105.7 92.7999 90.9001V55.4001H111.8V34.1002H92.7999L92.8999 12.4001Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.3 59.5001C25.3 55.6001 28.5 54.1002 33.8 54.1002C41.4 54.1002 51 56.4001 58.6 60.5001V37.0001C50.3 33.7001 42.1 32.4001 33.8 32.4001C13.5 32.4001 0 43.0001 0 60.7001C0 88.3001 38 83.9001 38 95.8001C38 100.4 34 101.9 28.4 101.9C20.1 101.9 9.5 98.5002 1.1 93.9002V117.7C10.4 121.7 19.8 123.4 28.4 123.4C49.2 123.4 63.5 113.1 63.5 95.2001C63.4 65.4001 25.3 70.7001 25.3 59.5001Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 360 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stripe"
      className={cn('h-5 w-auto shrink-0', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M360 77.4001C360 51.8001 347.6 31.6001 323.9 31.6001C300.1 31.6001 285.7 51.8001 285.7 77.2001C285.7 107.3 302.7 122.5 327.1 122.5C339 122.5 348 119.8 354.8 116V96.0001C348 99.4001 340.2 101.5 330.3 101.5C320.6 101.5 312 98.1001 310.9 86.3001H359.8C359.8 85.0001 360 79.8001 360 77.4001ZM310.6 67.9001C310.6 56.6001 317.5 51.9001 323.8 51.9001C329.9 51.9001 336.4 56.6001 336.4 67.9001H310.6Z"
        fill="#533AFD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M247.1 31.6001C237.3 31.6001 231 36.2001 227.5 39.4001L226.2 33.2001H204.2V149.8L229.2 144.5L229.3 116.2C232.9 118.8 238.2 122.5 247 122.5C264.9 122.5 281.2 108.1 281.2 76.4001C281.1 47.4001 264.6 31.6001 247.1 31.6001ZM241.1 100.5C235.2 100.5 231.7 98.4001 229.3 95.8001L229.2 58.7001C231.8 55.8001 235.4 53.8001 241.1 53.8001C250.2 53.8001 256.5 64.0001 256.5 77.1001C256.5 90.5001 250.3 100.5 241.1 100.5Z"
        fill="#533AFD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M169.8 25.7L194.9 20.3V0L169.8 5.3V25.7Z"
        fill="#533AFD"
      />
      <path d="M194.9 33.3H169.8V120.8H194.9V33.3Z" fill="#533AFD" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M142.9 40.7L141.3 33.3H119.7V120.8H144.7V61.5C150.6 53.8 160.6 55.2 163.7 56.3V33.3C160.5 32.1 148.8 29.9 142.9 40.7Z"
        fill="#533AFD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M92.8999 11.6001L68.4999 16.8001L68.3999 96.9001C68.3999 111.7 79.4999 122.6 94.2999 122.6C102.5 122.6 108.5 121.1 111.8 119.3V99.0001C108.6 100.3 92.7999 104.9 92.7999 90.1001V54.6001H111.8V33.3001H92.7999L92.8999 11.6001Z"
        fill="#533AFD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.3 58.7001C25.3 54.8001 28.5 53.3001 33.8 53.3001C41.4 53.3001 51 55.6001 58.6 59.7001V36.2001C50.3 32.9001 42.1 31.6001 33.8 31.6001C13.5 31.6001 0 42.2001 0 59.9001C0 87.5001 38 83.1001 38 95.0001C38 99.6001 34 101.1 28.4 101.1C20.1 101.1 9.5 97.7001 1.1 93.1001V116.9C10.4 120.9 19.8 122.6 28.4 122.6C49.2 122.6 63.5 112.3 63.5 94.4001C63.4 64.6001 25.3 69.9001 25.3 58.7001Z"
        fill="#533AFD"
      />
    </svg>
  )
}

/**
 * Stripe wordmark paired with a short platform sub-label (light UI).
 * Uses the foreground variant so the mark tracks `text-foreground` like kit slate.
 */
export function StripeLockup({
  label = PLATFORM_LOCKUP_SHORT,
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <StripeWordmark variant="foreground" />
      <span className="h-4 w-px bg-border" aria-hidden />
      <span className="text-sm font-medium tracking-tight text-foreground">
        {label}
      </span>
    </span>
  )
}

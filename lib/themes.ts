// Theme registry for the multi-theme Stripe Workshop Platform.
// A "theme" determines the module content and participant experience for an
// event. Only `fraud_radar` has working content today; the rest are roadmap
// placeholders surfaced in the creation flow and the SA Themes reference page.

import {
  type LucideIcon,
  Shield,
  CreditCard,
  Scale,
  Link2,
  RefreshCw,
} from 'lucide-react'

export type ThemeId =
  | 'fraud_radar'
  | 'online_payments'
  | 'disputes'
  | 'connect'
  | 'billing'

export type ThemeStatus = 'available' | 'coming_soon'

export type Theme = {
  id: ThemeId
  /** Visual glyph for the theme in lists and headers. */
  Icon: LucideIcon
  title: string
  /** Short description shown on selection cards. */
  description: string
  /** Longer paragraph shown on the SA Themes reference page. */
  blurb: string
  status: ThemeStatus
}

export const THEMES: Theme[] = [
  {
    id: 'fraud_radar',
    Icon: Shield,
    title: 'Fraud & Radar',
    description:
      'From first rules to advanced strategy: Radar rules, block lists, 3DS, disputes, ML scores, review queues, and team workflows.',
    blurb:
      'The flagship hands-on theme. Participants take control of a live Stripe account and defend it against payment fraud, progressing from basics through advanced team operations. Covers Radar risk scores, custom rules, block and allow lists, 3D Secure, disputes, and then goes deeper into the machine learning behind risk scoring, review queue workflows, rule versioning strategy, and how fraud analysts collaborate at scale. Suitable for anyone from first-time Radar users to dedicated fraud teams.',
    status: 'available',
  },
  {
    id: 'online_payments',
    Icon: CreditCard,
    title: 'Online Payments 101',
    description:
      'A hands-on guide to accepting payments on the internet with Stripe, from your first API call to a production-ready integration.',
    blurb:
      'A foundational walkthrough of how money moves through Stripe. Covers PaymentIntents, Stripe.js and Elements, the full payment lifecycle, webhooks, idempotency, payment methods, 3D Secure, and testing strategies. Designed for engineers and product teams who are new to Stripe and want a confident mental model before going live.',
    status: 'available',
  },
  {
    id: 'billing',
    Icon: RefreshCw,
    title: 'Billing & Subscriptions',
    description:
      'Design and implement recurring revenue with Stripe Billing, from pricing models to dunning, the customer portal, and revenue analytics.',
    blurb:
      'A practical tour of Stripe Billing covering subscriptions and pricing, invoices and proration, trials and coupons, the customer portal, dunning and revenue recovery, usage-based billing, and billing analytics. Built for teams launching or scaling recurring revenue.',
    status: 'available',
  },
  {
    id: 'disputes',
    Icon: Scale,
    title: 'Disputes & Chargebacks',
    description:
      'Deep dive into the dispute lifecycle, evidence strategy, and prevention.',
    blurb:
      'An operational deep dive into disputes and chargebacks: the lifecycle from inquiry to resolution, building winning evidence submissions, and the prevention tactics that reduce dispute rates over time. Built for support, risk, and finance teams.',
    status: 'coming_soon',
  },
  {
    id: 'connect',
    Icon: Link2,
    title: 'Stripe Connect',
    description:
      'Building platforms and marketplaces: account types, payouts, and onboarding flows.',
    blurb:
      'Everything platforms and marketplaces need to know about Stripe Connect: choosing between account types, designing onboarding flows, handling payouts and fees, and managing connected accounts at scale. For teams building multi-party payment products.',
    status: 'coming_soon',
  },
]

const THEME_MAP = new Map<string, Theme>(THEMES.map((t) => [t.id, t]))

export function getTheme(id: string | null | undefined): Theme | null {
  if (!id) return null
  return THEME_MAP.get(id) ?? null
}

export function isAvailableTheme(id: string | null | undefined): boolean {
  return getTheme(id)?.status === 'available'
}

export const PLATFORM_NAME = 'Stripe Workshop Platform'
export const PLATFORM_TAGLINE = 'Hands-on learning experiences for Stripe customers'
/** Short label next to the Stripe wordmark (matches marketing lockup). */
export const PLATFORM_LOCKUP_SHORT = 'Workshop Platform'

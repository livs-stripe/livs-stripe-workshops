import type { Callout, CalloutKind } from '@/lib/workshop-modules'
import {
  Info,
  Lightbulb,
  TriangleAlert,
  BookOpenText,
  ShieldAlert,
  CreditCard,
  RefreshCw,
} from 'lucide-react'

const CONFIG: Record<
  CalloutKind,
  { label: string; Icon: typeof Info; cls: string; iconCls: string }
> = {
  info: {
    label: 'Info',
    Icon: Info,
    cls: 'border-info/30 bg-info/[0.05]',
    iconCls: 'text-info',
  },
  tip: {
    label: 'Tip',
    Icon: Lightbulb,
    cls: 'border-success/30 bg-success/[0.05]',
    iconCls: 'text-success',
  },
  warning: {
    label: 'Watch out',
    Icon: TriangleAlert,
    cls: 'border-warning/40 bg-warning/[0.06]',
    iconCls: 'text-warning',
  },
  explanation: {
    label: 'Why this matters',
    Icon: BookOpenText,
    cls: 'border-border bg-secondary/60',
    iconCls: 'text-muted-foreground',
  },
  'fraud-fact': {
    label: 'Fraud fact',
    Icon: ShieldAlert,
    cls: 'border-primary/30 bg-primary/[0.05]',
    iconCls: 'text-primary',
  },
  'stripe-fact': {
    label: 'Stripe fact',
    Icon: CreditCard,
    cls: 'border-primary/30 bg-primary/[0.05]',
    iconCls: 'text-primary',
  },
  'billing-fact': {
    label: 'Billing fact',
    Icon: RefreshCw,
    cls: 'border-primary/30 bg-primary/[0.05]',
    iconCls: 'text-primary',
  },
}

export function WorkshopCallout({ callout }: { callout: Callout }) {
  const { label, Icon, cls, iconCls } = CONFIG[callout.kind]
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${cls}`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${iconCls}`} />
      <div className="min-w-0">
        <p className="label-caps mb-1 text-muted-foreground">{label}</p>
        <p className="text-sm leading-relaxed text-foreground">{callout.text}</p>
      </div>
    </div>
  )
}

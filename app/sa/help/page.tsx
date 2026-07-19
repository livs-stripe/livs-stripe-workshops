import { Card } from '@/components/ui/card'
import {
  BookOpen,
  Users,
  Shield,
  Zap,
  HelpCircle,
  ExternalLink,
  MonitorPlay,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Icon className="size-5 text-primary" />
        {title}
      </h2>
      {children}
    </Card>
  )
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border py-3 last:border-0">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="size-4 shrink-0 text-primary" />
        {q}
      </summary>
      <div className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  )
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Docs</h1>
        <p className="mt-1 text-muted-foreground">
          Everything you need to run a successful workshop session.
        </p>
      </div>

      {/* Quick Start */}
      <Section icon={Zap} title="Quick start guide">
        <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
            <div><strong className="text-foreground">Create an event.</strong> Go to the Dashboard and click "Create session". Pick a theme, set the duration, and choose how many participants you expect (you can add more later).</div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
            <div><strong className="text-foreground">Wait for provisioning.</strong> The platform creates a Stripe test account for each participant. This takes about 1 second per account. The progress bar shows how many are ready.</div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
            <div><strong className="text-foreground">Share the access code.</strong> Once all checks pass, copy the 6-character access code and share it with participants. They enter it on the homepage to join.</div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">4</span>
            <div><strong className="text-foreground">Monitor the session.</strong> Use the event console to watch participants join, track progress on the leaderboard, and fire attack waves (challenge mode).</div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">5</span>
            <div><strong className="text-foreground">End the session.</strong> Click "End session now" when you're done. All test Stripe accounts are automatically cleaned up.</div>
          </li>
        </ol>
      </Section>

      {/* Event Types */}
      <Section icon={MonitorPlay} title="Event types">
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg border p-4">
            <h3 className="mb-1 font-semibold text-foreground">Workshop (guided)</h3>
            <p>Step-by-step modules that walk participants through Stripe features using their own test Dashboard. Participants work at their own pace, reading instructions and completing tasks in the Stripe Dashboard. Best for learning and onboarding.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-1 font-semibold text-foreground">Challenge (gamified)</h3>
            <p>Participants defend a simulated business against fraud attacks by writing Radar rules. You fire attack waves from the console and participants earn points based on how many fraudulent payments their rules block. A leaderboard tracks scores in real time. Best for engagement and competitive sessions.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-1 font-semibold text-foreground">Quiz (knowledge check)</h3>
            <p>Multiple-choice questions covering Stripe concepts. Participants earn points for correct answers. Can be combined with workshop mode for a scored learning experience.</p>
          </div>
        </div>
      </Section>

      {/* Session Management */}
      <Section icon={Clock} title="Managing sessions">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div><strong className="text-foreground">Extending time.</strong> Click "Extend 30 min" on the event console to add more time. You can extend as many times as you need.</div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div><strong className="text-foreground">Adding capacity.</strong> If you run out of participant slots, click "Add accounts" on the capacity warning. You can add 5 to 50 accounts at a time, up to 200 total.</div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div><strong className="text-foreground">Projector view.</strong> Click "Projector view" to open a full-screen leaderboard you can display on a screen during the session.</div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div><strong className="text-foreground">Exporting data.</strong> Click "Export CSV" to download a spreadsheet of participant scores and progress.</div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div><strong className="text-foreground">Ending a session.</strong> Ending is permanent. All participant Stripe test accounts are deleted from the platform. Make sure you've exported any data you need first.</div>
          </div>
        </div>
      </Section>

      {/* Participants */}
      <Section icon={Users} title="Participant experience">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>When a participant joins, the platform:</p>
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>Assigns them a pre-provisioned Stripe test account</li>
            <li>Gives them a "Open Stripe Dashboard" button that generates a fresh login link each time</li>
            <li>Shows the workshop or challenge content based on the event type</li>
            <li>Tracks their progress through modules in real time</li>
          </ol>
          <p className="mt-3">Participants only need the 6-character access code and their name/email to join. No Stripe account or signup is required.</p>
          <p>If a participant closes their browser, they can rejoin with the same email address and pick up where they left off.</p>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section icon={Shield} title="Troubleshooting">
        <div className="space-y-0">
          <FaqItem q="Provisioning is stuck or accounts failed">
            Check the "Connected accounts" panel on the event console. Failed accounts show an error message with details. Click "Retry failed" to re-attempt provisioning. The most common cause is Stripe API rate limits, which resolve on retry with automatic backoff.
          </FaqItem>

          <FaqItem q="Participant can't open the Stripe Dashboard">
            Dashboard login links expire after 5 minutes. Have the participant click the button again to generate a fresh link. If it still fails, check the browser console for errors. Pop-up blockers can also prevent the Dashboard from opening in a new tab.
          </FaqItem>

          <FaqItem q="Attack waves aren't working (challenge mode)">
            Attack waves require the participant to have active Radar rules. If no rules are configured, all simulated payments will succeed (nothing to block). Make sure participants have completed the early modules before firing waves.
          </FaqItem>

          <FaqItem q="Session timer ran out but we're not finished">
            Click "Extend 30 min" to add more time. You can extend as many times as needed. If the session has already ended, you'll need to create a new event.
          </FaqItem>

          <FaqItem q="Capacity reached but more people want to join">
            Click "Add accounts" in the capacity warning area. Select how many additional accounts to provision (5 to 50). New accounts take about 1 second each to create. The maximum is 200 accounts per event.
          </FaqItem>

          <FaqItem q="Pre-flight checks are failing">
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li><strong>Stripe API key:</strong> Make sure <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code> is set in your environment and starts with <code className="rounded bg-muted px-1">sk_test_</code> or <code className="rounded bg-muted px-1">sk_live_</code>.</li>
              <li><strong>Database:</strong> Check that your PostgreSQL connection is active and the database is accessible.</li>
              <li><strong>Account provisioning:</strong> If accounts are still being created, wait for the progress bar to complete.</li>
            </ul>
          </FaqItem>

          <FaqItem q="Can I run multiple sessions at the same time?">
            Yes. Each session has its own access code, participant pool, and Stripe accounts. You can run as many concurrent sessions as your Stripe API rate limits allow (typically 3-4 sessions of 25 participants each).
          </FaqItem>
        </div>
      </Section>

      {/* Useful Links */}
      <Section icon={BookOpen} title="Useful links">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Stripe Dashboard', url: 'https://dashboard.stripe.com', desc: 'Your platform account' },
            { label: 'Stripe Radar Docs', url: 'https://docs.stripe.com/radar', desc: 'Fraud prevention rules' },
            { label: 'Stripe Billing Docs', url: 'https://docs.stripe.com/billing', desc: 'Subscriptions & invoicing' },
            { label: 'Stripe Connect Docs', url: 'https://docs.stripe.com/connect', desc: 'Connected accounts' },
            { label: 'Test Cards', url: 'https://docs.stripe.com/testing#cards', desc: 'Card numbers for testing' },
            { label: 'API Reference', url: 'https://docs.stripe.com/api', desc: 'Full Stripe API docs' },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </Section>
    </div>
  )
}

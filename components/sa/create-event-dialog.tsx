'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/events'
import { THEMES, getTheme, type ThemeId } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Plus,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'

type EventType = 'workshop' | 'challenge'
type Step = 'type' | 'theme' | 'form' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'type', label: 'Choose Type' },
  { key: 'theme', label: 'Choose Theme' },
  { key: 'form', label: 'Event Details' },
]

function StepIndicator({ current }: { current: Step }) {
  // 'done' is not a numbered step; treat it as past the form.
  const activeIndex =
    current === 'done' ? STEPS.length : STEPS.findIndex((s) => s.key === current)
  return (
    <div className="mb-1 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const state =
          i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo'
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                state === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : state === 'done'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {state === 'done' ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={`text-xs font-medium ${
                state === 'todo' ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 bg-border sm:w-6" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CreateEventDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('type')
  const [eventType, setEventType] = useState<EventType>('workshop')
  const [theme, setTheme] = useState<ThemeId | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; accessCode: string } | null>(
    null,
  )
  const [copied, setCopied] = useState(false)
  const [leaderboard, setLeaderboard] = useState(true)
  const [projector, setProjector] = useState(true)

  const selectedTheme = getTheme(theme)

  function reset() {
    setStep('type')
    setEventType('workshop')
    setTheme(null)
    setError(null)
    setResult(null)
    setCopied(false)
    setLeaderboard(true)
    setProjector(true)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  function pickType(type: EventType) {
    setEventType(type)
    setStep('theme')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!theme) {
      setStep('theme')
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.set('eventType', eventType)
    formData.set('eventTheme', theme)
    formData.set('leaderboardEnabled', leaderboard ? 'on' : 'off')
    formData.set('projectorEnabled', projector ? 'on' : 'off')
    startTransition(async () => {
      try {
        const res = await createEvent(formData)
        setResult({ id: res.id, accessCode: res.accessCode })
        setStep('done')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create event')
      }
    })
  }

  async function copyCode() {
    if (!result) return
    await navigator.clipboard.writeText(result.accessCode)
    setCopied(true)
    toast.success('Access code copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" /> New session
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        {/* Step 1 — Choose type */}
        {step === 'type' && (
          <>
            <DialogHeader>
              <StepIndicator current="type" />
              <DialogTitle>Create a session</DialogTitle>
              <DialogDescription>
                Workshops guide participants at their own pace. Challenges turn
                it into a timed competition.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => pickType('workshop')}
                className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-stripe"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </span>
                <span className="font-semibold">Workshop</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Self-paced, document-style walkthrough across guided modules.
                  No scoring.
                </span>
              </button>
              <button
                type="button"
                onClick={() => pickType('challenge')}
                className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-stripe"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Trophy className="size-5" />
                </span>
                <span className="font-semibold">Challenge</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Gamified, timed competition with live attack waves and a
                  leaderboard.
                </span>
              </button>
            </div>
          </>
        )}

        {/* Step 2 — Choose theme */}
        {step === 'theme' && (
          <>
            <DialogHeader>
              <StepIndicator current="theme" />
              <DialogTitle>What topic does this session cover?</DialogTitle>
              <DialogDescription>
                Choose a theme. This determines the module content and
                participant experience.
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[55vh] gap-3 overflow-y-auto py-1 pr-1 sm:grid-cols-2">
              {THEMES.map((t) => {
                const available = t.status === 'available'
                const selected = theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!available}
                    title={available ? undefined : 'This theme is coming soon'}
                    aria-pressed={selected}
                    onClick={() => available && setTheme(t.id)}
                    className={[
                      'group relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all',
                      available
                        ? 'cursor-pointer bg-card hover:border-primary hover:shadow-stripe'
                        : 'cursor-not-allowed bg-card opacity-50',
                      selected
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border',
                    ].join(' ')}
                  >
                    <div className="flex w-full items-start justify-between">
                      <span aria-hidden className="text-2xl">
                        {t.icon}
                      </span>
                      {available ? (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                          Available now
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Lock className="size-2.5" /> Coming soon
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">{t.title}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {t.description}
                    </span>
                    {selected && (
                      <span className="absolute right-3 bottom-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                toast.success(
                  'Suggestion noted — themes are added based on SA demand.',
                )
              }
              className="self-start text-xs font-medium text-primary transition-colors hover:text-primary-hover"
            >
              + Suggest a theme
            </button>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('type')}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                type="button"
                disabled={!theme}
                onClick={() => setStep('form')}
              >
                Continue <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3 — Event details */}
        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <StepIndicator current="form" />
              <DialogTitle>Event details</DialogTitle>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
                <span className="text-muted-foreground">Creating:</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  {eventType === 'workshop' ? (
                    <BookOpen className="size-3.5 text-primary" />
                  ) : (
                    <Trophy className="size-3.5 text-primary" />
                  )}
                  {eventType === 'workshop' ? 'Workshop' : 'Challenge'}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <span aria-hidden>{selectedTheme?.icon}</span>
                  {selectedTheme?.title}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('theme')}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </DialogHeader>

            <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto py-1 pr-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Session name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder={
                    eventType === 'workshop'
                      ? 'Acme Co — Radar Onboarding'
                      : 'Q3 Radar Challenge'
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customerName">Customer</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customerEmail">Customer email</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    placeholder="team@acme.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">
                  Description{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="A short note shown to participants"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="maxParticipants">Max participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={500}
                    defaultValue={25}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={480}
                    step={5}
                    defaultValue={eventType === 'workshop' ? 90 : 60}
                    required
                  />
                </div>
              </div>

              {eventType === 'challenge' && (
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4">
                  <p className="label-caps text-muted-foreground">
                    Challenge configuration
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="startingBalance">Starting balance</Label>
                      <Input
                        id="startingBalance"
                        name="startingBalance"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={100}
                        defaultValue={1000}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="balanceCurrency">Currency</Label>
                      <select
                        id="balanceCurrency"
                        name="balanceCurrency"
                        defaultValue="AUD"
                        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15"
                      >
                        <option value="AUD">AUD</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="SGD">SGD</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="scoreIntervalSeconds">
                      Score refresh interval (seconds)
                    </Label>
                    <Input
                      id="scoreIntervalSeconds"
                      name="scoreIntervalSeconds"
                      type="number"
                      inputMode="numeric"
                      min={5}
                      max={120}
                      step={5}
                      defaultValue={20}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="leaderboardEnabled" className="cursor-pointer">
                      Live leaderboard
                    </Label>
                    <Switch
                      id="leaderboardEnabled"
                      checked={leaderboard}
                      onCheckedChange={setLeaderboard}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="projectorEnabled" className="cursor-pointer">
                      Projector view
                    </Label>
                    <Switch
                      id="projectorEnabled"
                      checked={projector}
                      onCheckedChange={setProjector}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="facilitatorNotes">
                  Facilitator notes{' '}
                  <span className="text-muted-foreground">(internal)</span>
                </Label>
                <Textarea
                  id="facilitatorNotes"
                  name="facilitatorNotes"
                  rows={2}
                  placeholder="Only visible to you in the session console."
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('theme')}
                disabled={pending}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    Create {eventType} <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Done */}
        {step === 'done' && result && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="size-4" />
                </span>
                {eventType === 'workshop' ? 'Workshop' : 'Challenge'} created
              </DialogTitle>
              <DialogDescription>
                Share this access code with participants to join.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <span className="font-mono text-2xl font-semibold tracking-[0.3em] text-foreground">
                {result.accessCode}
              </span>
              <Button variant="outline" size="sm" onClick={copyCode}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
              <Button onClick={() => router.push(`/sa/events/${result.id}`)}>
                Open console <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

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
import { Card } from '@/components/ui/card'
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
  Info,
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
  const [sessionDuration, setSessionDuration] = useState(120) // always stored in minutes
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('hours')

  const selectedTheme = getTheme(theme)
  const SelectedThemeIcon = selectedTheme?.Icon

  function reset() {
    setStep('type')
    setEventType('workshop')
    setTheme(null)
    setError(null)
    setResult(null)
    setCopied(false)
    setLeaderboard(true)
    setProjector(true)
    setSessionDuration(120)
    setDurationUnit('hours')
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
                const ThemeIcon = t.Icon
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
                      <span
                        aria-hidden
                        className="flex size-10 items-center justify-center rounded-md bg-secondary text-primary"
                      >
                        <ThemeIcon className="size-5" />
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
            <a
              href="mailto:livs@stripe.com?subject=Workshop%20Platform%20Suggestion"
              className="self-start text-xs font-medium text-primary transition-colors hover:text-primary-hover"
            >
              + Suggest a theme
            </a>
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
                  {SelectedThemeIcon && (
                    <SelectedThemeIcon
                      className="size-3.5 text-primary"
                      aria-hidden
                    />
                  )}
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
                      ? 'Acme Co — payments workshop'
                      : 'Q3 team challenge'
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
                  <Label htmlFor="sfOpportunityId">Salesforce Opportunity ID</Label>
                  <Input
                    id="sfOpportunityId"
                    name="sfOpportunityId"
                    placeholder="006..."
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
                    max={100}
                    placeholder="1–100"
                    required
                  />
                </div>
                <input type="hidden" name="durationMinutes" value={sessionDuration} />
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
                <Label>Session duration</Label>
                <p className="text-xs text-muted-foreground">
                  The event automatically closes when the timer runs out.
                  Participants will be shown an end screen.
                </p>

                {/* Unit toggle */}
                <div className="mt-2 flex gap-1 rounded-lg border border-border bg-card p-0.5">
                  {(['hours', 'days'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        setDurationUnit(unit)
                        setSessionDuration(unit === 'hours' ? 120 : 1440)
                      }}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        durationUnit === unit
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {unit === 'hours' ? 'Hours' : 'Days'}
                    </button>
                  ))}
                </div>

                {/* Quick-pick presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {durationUnit === 'hours'
                    ? [
                        { m: 30, label: '30 min' },
                        { m: 60, label: '1 hour' },
                        { m: 120, label: '2 hours' },
                        { m: 180, label: '3 hours' },
                        { m: 240, label: '4 hours' },
                        { m: 480, label: '8 hours' },
                      ].map((opt) => (
                        <button
                          key={opt.m}
                          type="button"
                          onClick={() => setSessionDuration(opt.m)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            sessionDuration === opt.m
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))
                    : [
                        { m: 1440, label: '1 day' },
                        { m: 2880, label: '2 days' },
                        { m: 4320, label: '3 days' },
                        { m: 7200, label: '5 days' },
                        { m: 10080, label: '7 days' },
                        { m: 20160, label: '14 days' },
                      ].map((opt) => (
                        <button
                          key={opt.m}
                          type="button"
                          onClick={() => setSessionDuration(opt.m)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            sessionDuration === opt.m
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                </div>

                {/* Custom input */}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor="customDuration" className="text-xs">
                      Custom ({durationUnit === 'hours' ? 'minutes' : 'days'})
                    </Label>
                    <Input
                      id="customDuration"
                      type="number"
                      inputMode="numeric"
                      min={durationUnit === 'hours' ? 5 : 1}
                      max={durationUnit === 'hours' ? 1440 : 30}
                      step={durationUnit === 'hours' ? 5 : 1}
                      placeholder={durationUnit === 'hours' ? 'e.g. 150' : 'e.g. 5'}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (durationUnit === 'hours') {
                          if (Number.isInteger(v) && v >= 5 && v <= 1440) {
                            setSessionDuration(v)
                          }
                        } else {
                          if (Number.isInteger(v) && v >= 1 && v <= 30) {
                            setSessionDuration(v * 1440)
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground sm:pb-2">
                    Selected:{' '}
                    <span className="font-mono text-foreground">
                      {sessionDuration >= 1440
                        ? `${Math.round((sessionDuration / 1440) * 10) / 10} day${sessionDuration >= 2880 ? 's' : ''}`
                        : sessionDuration >= 60
                          ? `${Math.round((sessionDuration / 60) * 10) / 10} hour${sessionDuration >= 120 ? 's' : ''}`
                          : `${sessionDuration} min`}
                    </span>
                  </p>
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
            <Card className="flex gap-3 border-info/30 bg-info/5 p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
              <p className="text-left text-xs leading-relaxed text-muted-foreground">
                Participant data for this event is stored for{' '}
                <span className="font-medium text-foreground">30 days</span>, then
                automatically deleted. Export participant records from the session
                console before then if you need them.
              </p>
            </Card>
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

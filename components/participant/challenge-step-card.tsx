'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Lock,
  Check,
  ExternalLink,
  Copy,
  AlertTriangle,
  Zap,
  Loader2,
} from 'lucide-react'
import type { ChallengeStep } from '@/lib/challenge-modules'

type StepState = 'locked' | 'active' | 'completed'

export function ChallengeStepCard({
  step,
  state,
  onComplete,
  onFireAttack,
  attackStatus,
}: {
  step: ChallengeStep
  state: StepState
  onComplete: () => void
  onFireAttack?: () => void
  attackStatus?: {
    status: string
    chargesFired: number
    chargesBlocked: number
    chargesSucceeded: number
    amountLostCents: number
  } | null
}) {
  const [checkboxes, setCheckboxes] = useState<Record<number, boolean>>({})
  const [mainCheckbox, setMainCheckbox] = useState(false)
  const [copied, setCopied] = useState(false)
  const [firing, setFiring] = useState(false)

  if (state === 'locked') {
    return (
      <Card className="relative border-border/50 bg-muted/30 p-5 opacity-60">
        <div className="flex items-center gap-3">
          <Lock className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground/70">Complete the previous step first</p>
          </div>
        </div>
      </Card>
    )
  }

  if (state === 'completed') {
    return (
      <Card className="border-l-4 border-l-emerald-600 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100">
            <Check className="size-3.5 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        {step.type === 'fire' && attackStatus && attackStatus.status === 'complete' && (
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
            <span className="font-medium">Result:</span>{' '}
            {attackStatus.chargesBlocked} blocked, {attackStatus.chargesSucceeded} through
            {attackStatus.amountLostCents > 0 && (
              <span className="ml-2 text-red-600">
                -${(attackStatus.amountLostCents / 100).toFixed(2)} lost
              </span>
            )}
          </div>
        )}
      </Card>
    )
  }

  // Active state — render based on step type
  async function handleCopyRule() {
    if (!step.ruleCode) return
    await navigator.clipboard.writeText(step.ruleCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFire() {
    setFiring(true)
    onFireAttack?.()
  }

  const checklist = step.checklist ?? []
  const allChecklistDone = checklist.length > 0
    ? checklist.every((_, i) => checkboxes[i])
    : true
  const canConfirm = step.type === 'fire'
    ? false
    : step.type === 'verify'
      ? allChecklistDone
      : step.type === 'read'
        ? true
        : mainCheckbox

  return (
    <Card
      className={`p-5 ${step.type === 'fire' ? 'border-red-200 bg-red-50/50' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold">{step.title}</h4>
        <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {step.type}
        </span>
      </div>

      {/* Read type */}
      {step.type === 'read' && step.content && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {step.content}
        </p>
      )}

      {/* Action type */}
      {step.type === 'action' && (
        <div className="mb-4">
          {step.instruction && (
            <p className="mb-3 text-sm text-muted-foreground">{step.instruction}</p>
          )}
          {step.dashboardLink && (
            <a
              href={step.dashboardLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Open in Dashboard <ExternalLink className="size-3" />
            </a>
          )}
          {step.checkboxLabel && (
            <label className="mt-2 flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={mainCheckbox}
                onChange={(e) => setMainCheckbox(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border accent-primary"
              />
              {step.checkboxLabel}
            </label>
          )}
        </div>
      )}

      {/* Rule type */}
      {step.type === 'rule' && (
        <div className="mb-4">
          {step.instruction && (
            <p className="mb-3 text-sm text-muted-foreground">{step.instruction}</p>
          )}
          {step.ruleCode && (
            <div className="mb-3 flex items-center gap-2 rounded-md border bg-slate-900 px-4 py-3">
              <code className="flex-1 font-mono text-[13px] text-emerald-400">
                {step.ruleCode}
              </code>
              <button
                onClick={handleCopyRule}
                className="shrink-0 text-slate-400 transition-colors hover:text-white"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
          )}
          {step.ruleExplanation && (
            <p className="mb-3 text-xs text-muted-foreground">{step.ruleExplanation}</p>
          )}
          {step.ruleAction && (
            <p className="mb-3 text-xs font-medium">
              Set to: <span className={step.ruleAction === 'block' ? 'text-red-600' : 'text-amber-600'}>{step.ruleAction === 'block' ? 'Block' : 'Review'}</span>
            </p>
          )}
          {step.checkboxLabel && (
            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={mainCheckbox}
                onChange={(e) => setMainCheckbox(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border accent-primary"
              />
              {step.checkboxLabel}
            </label>
          )}
        </div>
      )}

      {/* Verify type */}
      {step.type === 'verify' && (
        <div className="mb-4">
          <ul className="flex flex-col gap-2.5">
            {checklist.map((item, i) => (
              <li key={i}>
                <label className="flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={!!checkboxes[i]}
                    onChange={(e) =>
                      setCheckboxes((prev) => ({ ...prev, [i]: e.target.checked }))
                    }
                    className="mt-0.5 size-4 rounded border-border accent-primary"
                  />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fire type */}
      {step.type === 'fire' && (
        <div className="mb-4">
          {step.fireDescription && (
            <p className="mb-3 text-sm text-muted-foreground">{step.fireDescription}</p>
          )}
          {step.expectedCharges && (
            <p className="mb-2 text-xs font-medium text-red-700">
              <Zap className="mr-1 inline size-3" />
              {step.expectedCharges} charges incoming
            </p>
          )}
          {step.warningText && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {step.warningText}
            </div>
          )}

          {attackStatus?.status === 'running' && (
            <div className="rounded-md bg-red-100 p-4 text-center">
              <Loader2 className="mx-auto mb-2 size-5 animate-spin text-red-600" />
              <p className="text-sm font-medium text-red-800">Attack in progress...</p>
              <p className="text-xs text-red-600">
                {attackStatus.chargesFired} fired • {attackStatus.chargesBlocked} blocked
              </p>
            </div>
          )}

          {attackStatus?.status === 'complete' && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Attack complete</p>
              <p className="text-xs text-muted-foreground">
                {attackStatus.chargesBlocked}/{attackStatus.chargesFired} blocked •{' '}
                {attackStatus.amountLostCents > 0 && (
                  <span className="text-red-600">
                    ${(attackStatus.amountLostCents / 100).toFixed(2)} lost
                  </span>
                )}
              </p>
            </div>
          )}

          {!attackStatus && (
            <Button
              onClick={handleFire}
              disabled={firing}
              className="w-full bg-red-600 text-white hover:bg-red-700"
              size="lg"
            >
              {firing ? (
                <><Loader2 className="size-4 animate-spin" /> Firing...</>
              ) : (
                <><Zap className="size-4" /> Fire Attack</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Confirm button for non-fire steps */}
      {step.type !== 'fire' && (
        <Button
          onClick={onComplete}
          disabled={!canConfirm}
          size="sm"
          className="mt-1"
        >
          {step.type === 'read' ? 'Got it' : "I'm ready"} <ArrowIcon />
        </Button>
      )}
    </Card>
  )
}

function ArrowIcon() {
  return (
    <svg className="ml-1 size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

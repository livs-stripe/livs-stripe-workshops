'use client'

import { useState, Fragment } from 'react'
import { Check, Copy } from 'lucide-react'

// Minimal, dependency-free renderer for challenge instruction copy. Supports the
// subset of Markdown authors actually use in step content:
//   - fenced ``` code blocks  -> scrollable code block with a copy button
//   - inline `code`           -> monospaced chip
//   - **bold**                -> emphasis
//   - blank lines             -> paragraph breaks
// Anything else renders as plain text. This keeps instructions readable without
// pulling a full Markdown/highlighting library into the bundle.
export function ChallengeInstruction({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const blocks = splitFencedBlocks(text)

  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <CodeBlock key={i} code={block.content} lang={block.lang} />
        ) : (
          <Paragraphs key={i} text={block.content} />
        ),
      )}
    </div>
  )
}

type Block = { type: 'text' | 'code'; content: string; lang?: string }

function splitFencedBlocks(text: string): Block[] {
  const blocks: Block[] = []
  const fence = /```([a-zA-Z0-9]*)\n?([\s\S]*?)```/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = fence.exec(text)) !== null) {
    if (match.index > last) {
      blocks.push({ type: 'text', content: text.slice(last, match.index) })
    }
    blocks.push({
      type: 'code',
      lang: match[1] || undefined,
      content: match[2].replace(/\n$/, ''),
    })
    last = fence.lastIndex
  }
  if (last < text.length) {
    blocks.push({ type: 'text', content: text.slice(last) })
  }
  return blocks
}

function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length === 0) return null

  return (
    <>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="mb-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground last:mb-0"
        >
          {renderInline(p)}
        </p>
      ))}
    </>
  )
}

// Handles inline **bold** and `code` within a text segment.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12.5px] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <div className="mb-3 overflow-hidden rounded-md border border-border bg-slate-900">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed">
        <code className="font-mono text-emerald-300">{code}</code>
      </pre>
    </div>
  )
}

'use client'
import React from 'react'

// ═══════════════════════════════════════════════════════════════
//  StatCard
// ═══════════════════════════════════════════════════════════════
type Accent = 'default' | 'highlight' | 'danger' | 'success'

const ACCENT_COLORS: Record<Accent, string> = {
  default:   'var(--sky)',
  highlight: 'var(--sky-bright)',
  danger:    'var(--red)',
  success:   'var(--green)',
}

interface StatCardProps {
  label: string
value: React.ReactNode
  sub?: string
  accent?: Accent
  icon?: string
}

export function StatCard({ label, value, sub, accent = 'default', icon }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${ACCENT_COLORS[accent]}`,
      padding: '20px 22px',
      transition: 'transform 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{ fontSize: 28, opacity: 0.35, marginTop: 2 }}>{icon}</div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Badge
// ═══════════════════════════════════════════════════════════════
type BadgeVariant = 'present' | 'absent' | 'submitted' | 'pending' | 'admin' | 'chihuy' | 'trungdoi' | 'info'

const BADGE: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  present:   { bg: 'rgba(39,174,96,.2)',    color: '#5ddf8a', border: 'rgba(39,174,96,.4)' },
  absent:    { bg: 'rgba(192,57,43,.2)',    color: '#ff8080', border: 'rgba(192,57,43,.4)' },
  submitted: { bg: 'rgba(91,200,245,.12)', color: 'var(--sky-bright)', border: 'rgba(91,200,245,.35)' },
  pending:   { bg: 'rgba(26,110,168,.12)', color: 'var(--text-muted)', border: 'var(--border)' },
  admin:     { bg: 'rgba(91,200,245,.18)', color: 'var(--sky-bright)', border: 'rgba(91,200,245,.4)' },
  chihuy:    { bg: 'rgba(58,155,213,.2)',  color: 'var(--sky-light)',  border: 'rgba(58,155,213,.4)' },
  trungdoi:  { bg: 'rgba(26,110,168,.12)', color: 'var(--text-muted)', border: 'var(--border)' },
  info:      { bg: 'rgba(26,110,168,.18)', color: 'var(--sky-bright)', border: 'var(--border)' },
}

export function Badge({ children, variant = 'pending' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const s = BADGE[variant]
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 3,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
//  PageHeader
// ═══════════════════════════════════════════════════════════════
export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: React.ReactNode
  right?: React.ReactNode
}) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: 'var(--sky-bright)', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right ?? (
        <div style={{ background: 'rgba(91,200,245,.08)', border: '1px solid rgba(91,200,245,.2)', padding: '6px 14px', borderRadius: 4, fontSize: 13, color: 'var(--sky-bright)', whiteSpace: 'nowrap' }}>
          {today}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  TableCard
// ═══════════════════════════════════════════════════════════════
export function TableCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', marginBottom: 24 }}>
      <div style={{
        // background: 'rgba(26,110,168,.18)',
        background: 'rgba(92,168,26,.84)',
        padding: '13px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--sky-bright)', margin: 0 }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  FormCard
// ═══════════════════════════════════════════════════════════════
export function FormCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: 28, marginBottom: 20 }}>
      <h3 style={{
        fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
        color: 'var(--sky-bright)', marginBottom: 22, paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Field + Input + Select + Textarea
// ═══════════════════════════════════════════════════════════════
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Button
// ═══════════════════════════════════════════════════════════════
type BtnVariant = 'primary' | 'danger' | 'ghost' | 'outline'

const BTN_COLORS: Record<BtnVariant, { bg: string; hover: string; border?: string }> = {
  primary: { bg: 'var(--sky)',   hover: 'var(--sky-light)' },
  danger:  { bg: 'var(--red)',   hover: 'var(--red-light)' },
  ghost:   { bg: 'rgba(26,110,168,.15)', hover: 'rgba(26,110,168,.3)' },
  outline: { bg: 'transparent', hover: 'rgba(91,200,245,.1)', border: '1px solid var(--sky-bright)' },
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Btn({ variant = 'primary', size = 'md', loading, children, style, disabled, ...rest }: BtnProps) {
  const c = BTN_COLORS[variant]
  const pad = size === 'sm' ? '7px 14px' : size === 'lg' ? '14px 32px' : '11px 24px'
  const fs  = size === 'sm' ? 12 : size === 'lg' ? 15 : 13

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        background: c.bg,
        border: c.border ?? 'none',
        padding: pad,
        color: 'var(--text)',
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        borderRadius: 4,
        opacity: (disabled || loading) ? 0.65 : 1,
        transition: 'background 0.15s, transform 0.1s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = c.hover }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = c.bg }}
      onMouseDown={e  => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e    => { e.currentTarget.style.transform = 'none' }}
    >
      {loading && <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%' }} />}
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Alert
// ═══════════════════════════════════════════════════════════════
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'success' | 'error' | 'info'
}

export function Alert({ type, children, style, ...rest }: AlertProps) {
  const s = {
    success: { bg: 'rgba(39,174,96,.15)', border: 'rgba(39,174,96,.4)', color: '#5ddf8a', icon: '✔' },
    error:   { bg: 'rgba(192,57,43,.15)', border: 'rgba(192,57,43,.45)', color: '#ff8080', icon: '✘' },
    info:    { bg: 'rgba(26,110,168,.15)', border: 'var(--border)', color: 'var(--sky-bright)', icon: 'ℹ' },
  }[type]

  return (
    <div
      {...rest}
      className="animate-fadein"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        padding: '12px 16px',
        borderRadius: 4,
        fontSize: 14,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        ...style, // ✅ nhận style từ ngoài
      }}
    >
      <span style={{ fontWeight: 700 }}>{s.icon}</span>
      {children}
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════
//  LiveDot
// ═══════════════════════════════════════════════════════════════
export function LiveDot() {
  return (
    <span
      className="animate-blink"
      style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#5ddf8a' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════
//  SectionDivider
// ═══════════════════════════════════════════════════════════════
interface SectionDividerProps {
  label?: string
  children?: React.ReactNode
}

export function SectionDivider({ label, children }: SectionDividerProps) {
  const content = label || children

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '20px 0 14px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }}>
      {content}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════
//  Grid helpers
// ═══════════════════════════════════════════════════════════════
export function Grid({ cols, gap = 16, children }: { cols: string; gap?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap }}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Input
// ═══════════════════════════════════════════════════════════════
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        background: 'rgba(26,110,168,.12)',
        border: '1px solid var(--border)',
        padding: '10px 12px',
        fontSize: 13,
        color: 'var(--text)',
        borderRadius: 4,
        outline: 'none',
        transition: 'border 0.15s, box-shadow 0.15s',
        ...props.style,
      }}
      onFocus={e => {
        e.currentTarget.style.border = '1px solid var(--sky-bright)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(91,200,245,.3)'
      }}
      onBlur={e => {
        e.currentTarget.style.border = '1px solid var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════
//  Select
// ═══════════════════════════════════════════════════════════════
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        background: 'rgba(26,110,168,.12)',
        border: '1px solid var(--border)',
        padding: '10px 12px',
        fontSize: 13,
        color: 'var(--text)',
        borderRadius: 4,
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
        transition: 'border 0.15s, box-shadow 0.15s',
        ...props.style,
      }}
      onFocus={e => {
        e.currentTarget.style.border = '1px solid var(--sky-bright)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(91,200,245,.3)'
      }}
      onBlur={e => {
        e.currentTarget.style.border = '1px solid var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════
// Textarea
// ═══════════════════════════════════════════════════════════════
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        background: 'rgba(26,110,168,.12)',
        border: '1px solid var(--border)',
        padding: '10px 12px',
        fontSize: 13,
        color: 'var(--text)',
        borderRadius: 4,
        outline: 'none',
        resize: 'vertical',
        minHeight: 90,
        transition: 'border 0.15s, box-shadow 0.15s',
        ...props.style,
      }}
      onFocus={e => {
        e.currentTarget.style.border = '1px solid var(--sky-bright)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(91,200,245,.3)'
      }}
      onBlur={e => {
        e.currentTarget.style.border = '1px solid var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}


// ═══════════════════════════════════════════════════════════════
// ProgressBar Component
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ProgressBar Component (FIX + UPGRADE)
// ═══════════════════════════════════════════════════════════════

type ProgressVariant = 'default' | 'success' | 'danger' | 'highlight'

const PROGRESS_COLORS: Record<ProgressVariant, string> = {
  default:   'var(--sky)',
  success:   'var(--green)',
  danger:    'var(--red)',
  highlight: 'var(--sky-bright)',
}

interface ProgressBarProps {
  value: number // 0 → 100
  label?: string
  sub?: string // ✅ thêm dòng này
  showPercent?: boolean
  variant?: ProgressVariant
}

export function ProgressBar({
  value,
  label,
  sub,
  showPercent = true,
  variant,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, value))

  // 🔥 auto màu theo % (rất hợp dashboard quân số)
  const autoVariant: ProgressVariant =
    percent >= 95 ? 'success' :
    percent >= 85 ? 'highlight' :
    'danger'

  const finalVariant = variant ?? autoVariant

  return (
    <div style={{ width: '100%', marginBottom: 12 }}>
      {/* Header */}
      {(label || showPercent) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          <span>{label}</span>
          {showPercent && <span>{percent}%</span>}
        </div>
      )}

      {/* Sub text */}
      {sub && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-dim)',
          marginBottom: 6,
        }}>
          {sub}
        </div>
      )}

      {/* Bar */}
      <div style={{
        width: '100%',
        height: 10,
        background: 'rgba(26,110,168,.12)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: PROGRESS_COLORS[finalVariant],
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
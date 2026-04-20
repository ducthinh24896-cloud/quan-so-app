/**
 * app/(app)/thongke/page.tsx
 *
 * Trang thống kê biểu đồ — chỉ Admin và Chỉ huy thấy.
 * Gồm 5 biểu đồ:
 *  1. Pie chart    — Tỷ lệ có mặt / vắng toàn đại đội
 *  2. Stacked Bar  — Bộ TĐ & Chiến sĩ từng trung đội
 *  3. Progress bar — Tỷ lệ từng trung đội
 *  4. Pie chart    — Phân tích lý do vắng mặt
 *  5. Radar chart  — So sánh tỷ lệ có mặt 4 trung đội
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { PageHeader, LiveDot, ProgressBar } from '@/components/ui'
import type { DailyStats } from '@/lib/types'

// ── Palette ───────────────────────────────────────────────────────────────────
const C_BLUE   = '#1a6ea8'
const C_RED    = '#c0392b'
const C_BRIGHT = '#5bc8f5'
const C_LIGHT  = '#3a9bd5'
const C_GREEN  = '#27ae60'
const C_ORANGE = '#e67e22'
const C_PURPLE = '#8e44ad'

const REASON_PALETTE = [C_BLUE, C_RED, C_BRIGHT, C_GREEN, C_ORANGE, C_PURPLE]

const TOOLTIP_STYLE = {
  background:   '#0c2440',
  border:       '1px solid rgba(26,110,168,.4)',
  color:        '#eaf6fd',
  fontSize:     13,
  borderRadius: 4,
}

const TICK_STYLE = { fill: '#7ab8d8', fontSize: 12 }

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ThongKePage() {
  const [stats,   setStats]   = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'day' | 'week' | 'month'>('day')
const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().slice(0, 10)
)
const fetchStats = useCallback(async () => {
  setLoading(true)

  try {
    const res = await fetch(`/api/stats?mode=${mode}&date=${selectedDate}`)
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  } finally {
    setLoading(false)
  }
}, [mode, selectedDate])

useEffect(() => {
  const id = setTimeout(() => {
    fetchStats()
  }, 300) // delay 300ms

  return () => clearTimeout(id)
}, [fetchStats])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Đang tải biểu đồ...
      </div>
    )
  }

  if (!stats) {
    return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Không thể tải dữ liệu.</div>
  }

  // ── Tính toán dữ liệu ──────────────────────────────────────────────────────

  const pctPresent = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0

  // 1. Pie — tổng đại đội
  const pieData = [
    { name: `Có mặt (${pctPresent}%)`,        value: stats.present },
    { name: `Vắng mặt (${100 - pctPresent}%)`, value: stats.absent  },
  ]

  // 2. Stacked Bar — từng trung đội
  const barData = stats.squads.map(s => ({
    name:             s.name.replace('Trung đội ', 'TĐ '),
    'CB TĐ có mặt':  s.btd.present,
    'CB TĐ vắng':    s.btd.absent,
    'CS có mặt':      s.cs.present,
    'CS vắng':        s.cs.absent,
  }))

  // 4. Pie — lý do vắng
  const reasonData = Object.entries(stats.reasons).map(([name, value]) => ({ name, value }))

  // 5. Radar — tỷ lệ từng trung đội
  const radarData = stats.squads.map(s => ({
    subject:      s.name.replace('Trung đội ', 'TĐ '),
    'Tỷ lệ % ':  s.total > 0 ? Math.round((s.present / s.total) * 100) : 100,
  }))

  // ── Card wrapper style ──────────────────────────────────────────────────────
const card: React.CSSProperties = {
  // background: 'linear-gradient(145deg, rgba(12,36,64,.9), rgba(7,25,43,.95))',
  border:     '1px solid rgba(91,200,245,.25)',
  padding:    '24px 20px',
  borderRadius: 12,

  boxShadow: `
    0 10px 30px rgba(0,0,0,.5),
    inset 0 0 20px rgba(91,200,245,.05)
  `,

  backdropFilter: 'blur(10px)',
  transition: 'all .25s ease',
}

const cardTitle: React.CSSProperties = {
  fontSize:      13,
  fontWeight:    700,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color:         'var(--sky-bright)',
  marginBottom:  20,
  position: 'relative',
  paddingBottom: 10,
}
  return (
    <div>
      <PageHeader
        title="Thống kê"
        subtitle={<><LiveDot />Biểu đồ phân tích quân số</>}
      />
      <div style={{
  fontSize: 12,
  color: 'var(--text-muted)',
  marginBottom: 10
}}>
  {mode === 'day' && `📅 Ngày: ${selectedDate}`}
  {mode === 'week' && `📊 Tuần của: ${selectedDate}`}
  {mode === 'month' && `📆 Tháng: ${selectedDate.slice(0, 7)}`}
</div>

      {/* ── Hàng 1: Pie tổng + Stacked bar ── */}
      <div   className="grid-2" style={{
        display:             'grid',
        gridTemplateColumns: '320px 1fr',
        gap:                 20,
        marginBottom:        20,
      }}>
        {/* Pie tổng đại đội */}
       <div
  style={{
    position: 'relative',
    borderRadius: 14,
    padding: 20,
    // background: `
    //   linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95)),
    //   radial-gradient(circle at top, rgba(91,200,245,.12), transparent)
    // `,
    backgroundColor: '#f1f166',
    border: '1px solid rgba(91,200,245,.25)',
    boxShadow: `
      inset 0 0 25px rgba(91,200,245,.08),
      0 10px 40px rgba(0,0,0,.6)
    `,
    overflow: 'hidden',
  }}
>
  {/* Radar scan */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'conic-gradient(from 0deg, rgba(91,200,245,0.2), transparent 40%)',
    animation: 'radarSpin 5s linear infinite',
    opacity: 0.2,
  }} />

  {/* Scan line */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.12), transparent)',
    animation: 'scanPie 3s linear infinite',
  }} />

  <style>{`
    @keyframes radarSpin {
      0% { transform: rotate(0deg) }
      100% { transform: rotate(360deg) }
    }
    @keyframes scanPie {
      0% { left: -100% }
      100% { left: 100% }
    }
    @keyframes pulseCore {
      0% { transform: scale(1); opacity: 1 }
      50% { transform: scale(1.08); opacity: .8 }
      100% { transform: scale(1); opacity: 1 }
    }
  `}</style>

  {/* Title */}
  <h3 style={{
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    // color: '#5bc8f5',
    color: '#007ce2ff',
    marginBottom: 20,
    // textShadow: '0 0 10px rgba(91,200,245,.6)',
    textShadow: '0 0 10px rgba(182, 193, 197, 0.6)',

  }}>
    🎯 Tỷ lệ có mặt toàn đại đội
    <div style={{
      height: 2,
      marginTop: 6,
      width: 60,
      background: 'linear-gradient(90deg, #5bc8f5, transparent)'
    }} />
  </h3>

  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <defs>
        {/* Gradient xanh */}
        <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5bc8f5" />
          <stop offset="100%" stopColor="#1a6ea8" />
        </linearGradient>

        {/* Gradient đỏ */}
        <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="100%" stopColor="#c62828" />
        </linearGradient>
      </defs>

      <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        innerRadius={70}
        outerRadius={110}
        paddingAngle={4}
        dataKey="value"
        isAnimationActive
        animationDuration={900}
      >
        <Cell
          fill="url(#blueGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1.5}
        />
        <Cell
          fill="url(#redGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1.5}
        />
      </Pie>

      <Tooltip contentStyle={{
        background: '#0c2440',
        border: '1px solid rgba(91,200,245,.4)',
        borderRadius: 6,
        color: '#eaf6fd',
        fontSize: 13,
        boxShadow: '0 0 15px rgba(91,200,245,.3)',
      }} />

      <Legend
        wrapperStyle={{
          color: '#9ecfe8',
          fontSize: 13,
          paddingTop: 10,
        }}
      />
    </PieChart>
  </ResponsiveContainer>

  {/* Core glow */}
  <div style={{
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(91,200,245,.35), transparent)',
    filter: 'blur(35px)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  }} />

  {/* Center HUD */}
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 2,
  }}>
    <span style={{
      fontSize: 46,
      fontWeight: 900,
      background: `linear-gradient(135deg,
        ${pctPresent >= 95 ? '#00e676' : pctPresent >= 85 ? '#0ae902ff' : '#ff5252'},
        #ffffff
      )`,
      WebkitBackgroundClip: 'text',
      // WebkitTextFillColor: 'transparent',
      // textShadow: `
      //   0 0 10px rgba(91,200,245,.7),
      //   0 0 25px rgba(91,200,245,.4)
      // `,
      animation: 'pulseCore 1.5s ease-in-out infinite',
    }}>
      {pctPresent}%
    </span>

    <div style={{
      fontSize: 12,
      color: '#ffff',
      // color: '#9ecfe8',
      marginTop: 4,
      letterSpacing: 1.5,
      fontWeight: 'bold',
    }}>
      có mặt / {stats.total} quân số
    </div>
  </div>
</div>

        {/* Stacked Bar */}
      <div
  style={{
    position: 'relative',
    borderRadius: 14,
    padding: 20,
    // background: `
    //   linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95)),
    //   radial-gradient(circle at top, rgba(91,200,245,.12), transparent)
    // `,
    backgroundColor: '#00e2cd',
    border: '1px solid rgba(91,200,245,.25)',
    boxShadow: `
      inset 0 0 25px rgba(91,200,245,.08),
      0 10px 40px rgba(0,0,0,.6)
    `,
    overflow: 'hidden',
  }}
>
  {/* Scan effect */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.12), transparent)',
    animation: 'scanBar 3s linear infinite',
  }} />

  <style>{`
    @keyframes scanBar {
      0% { left: -100% }
      100% { left: 100% }
    }
  `}</style>

  {/* Title */}
  <h3
    style={{
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      // color: '#5bc8f5',
            color: '#007ce2ff',

      marginBottom: 20,
      textShadow: '0 0 10px rgba(91,200,245,.6)',
    }}
  >
    📊 Cán bộ TĐ & Chiến sĩ từng trung đội
    <div
      style={{
        height: 2,
        marginTop: 6,
        width: 60,
        background: 'linear-gradient(90deg, #5bc8f5, transparent)',
      }}
    />
  </h3>

  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={barData} barCategoryGap="28%">
      <defs>
        {/* Gradient */}
        <linearGradient id="btdPresent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bc8f5" />
          <stop offset="100%" stopColor="#1a6ea8" />
        </linearGradient>

        <linearGradient id="btdAbsent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="100%" stopColor="#c62828" />
        </linearGradient>

        <linearGradient id="csPresent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e676" />
          <stop offset="100%" stopColor="#00c853" />
        </linearGradient>

        <linearGradient id="csAbsent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9100" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="name"
        tick={{ fill: '#9ecfe8', fontSize: 12 }}
        axisLine={{ stroke: 'rgba(91,200,245,.3)' }}
        tickLine={false}
      />

      <YAxis
        tick={{ fill: '#9ecfe8', fontSize: 12 }}
        axisLine={{ stroke: 'rgba(91,200,245,.3)' }}
        tickLine={false}
      />

      <Tooltip
        contentStyle={{
          background: '#0c2440',
          border: '1px solid rgba(91,200,245,.4)',
          borderRadius: 6,
          color: '#eaf6fd',
          fontSize: 13,
          boxShadow: '0 0 15px rgba(91,200,245,.3)',
        }}
      />

      <Legend
        wrapperStyle={{
          // color: '#9ecfe8',   
          fontSize: 12,
          paddingTop: 10,
        }}
      />

      {/* CB TĐ */}
      <Bar
        dataKey="CB TĐ có mặt"
        stackId="btd"
        fill="url(#btdPresent)"
        radius={[0, 0, 0, 0]}
      />
      <Bar
        dataKey="CB TĐ vắng"
        stackId="btd"
        fill="url(#btdAbsent)"
        radius={[6, 6, 0, 0]}
      />

      {/* CS */}
      <Bar
        dataKey="CS có mặt"
        stackId="cs"
        fill="url(#csPresent)"
        radius={[0, 0, 0, 0]}
      />
      <Bar
        dataKey="CS vắng"
        stackId="cs"
        fill="url(#csAbsent)"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
      </div>

      {/* ── Hàng 2: Progress bars + Lý do vắng + Radar ── */}
     <div  className="grid-3" style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
}}>

  {/* ================= PROGRESS ================= */}
  <div style={{
  ...card,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#12bf2f',
}}>

  {/* 🌌 NỀN ĐỘNG */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(circle at 20% 0%, rgba(91,200,245,.18), transparent 70%),
      radial-gradient(circle at 80% 100%, rgba(0,255,174,.12), transparent 70%),
      rgba(0,0,0,.6)
    `,
    animation: 'bgShift 6s ease-in-out infinite',
    zIndex: 0
  }} />

  {/* ⚡ TITLE */}
  <h3 style={{
    ...cardTitle,
    position: 'relative',
    zIndex: 2,
    textShadow: '0 0 10px rgba(91,200,245,.6)'
  }}>
    ⚡ Tỷ lệ có mặt từng trung đội
    <div style={{
      height: 2,
      marginTop: 6,
      width: 100,
      background: 'linear-gradient(90deg, #5bc8f5, transparent)'
    }} />
  </h3>

  {stats.squads.map(sq => {
    const pct = sq.total > 0
      ? Math.round((sq.present / sq.total) * 100)
      : 100

    const color =
      pct >= 95 ? '#00ffae' :
      pct >= 85 ? '#5bc8f5' :
      '#ff5252'

    const glow =
      pct >= 95 ? '0 0 14px #00ffae' :
      pct >= 85 ? '0 0 14px #5bc8f5' :
      '0 0 14px #ff5252'

    const status =
      pct >= 95 ? 'TỐT' :
      pct >= 85 ? 'ỔN' :
      'NGUY'

    return (
      <div
        key={sq.id}
        style={{
          marginBottom: 20,
          padding: '10px 12px',
          borderRadius: 8,
          transition: 'all .2s',
          position: 'relative',
          zIndex: 2
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,.04)'
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.transform = 'none'
        }}
      >

        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 13,
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--text)' }}>
            {sq.name}
          </span>

          <div style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}>
            {/* badge */}
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 12,
              border: `1px solid ${color}`,
              color: color,
              background: `${color}22`,
              textShadow: glow
            }}>
              {status}
            </span>

            {/* % */}
            <span style={{
              fontWeight: 900,
              color: color,
              textShadow: glow,
              animation: 'numberPulse 1.2s infinite'
            }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* PROGRESS */}
        <div style={{
          height: 14,
          borderRadius: 10,
          background: 'rgba(255,255,255,.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* thanh chính */}
          <div style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 10,
            background: `linear-gradient(90deg, ${color}, #ffffff)`,
            boxShadow: glow,
            transition: 'width .8s ease',
            position: 'relative'
          }}>

            {/* ⚡ ENERGY FLOW */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(120deg,
                  transparent 0%,
                  rgba(255,255,255,.6) 50%,
                  transparent 100%)
              `,
              animation: 'flow 1.5s linear infinite'
            }} />
          </div>

          {/* 🟢 DOT END */}
          <div style={{
            position: 'absolute',
            left: `calc(${pct}% - 6px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 12px ${color}`,
            animation: 'dotPulse 1.5s infinite'
          }} />
        </div>

        {/* SUB */}
        <div style={{
          fontSize: 11,
          marginTop: 5,
          color: 'var(--text-muted)'
        }}>
          {sq.present}/{sq.total} quân số
        </div>

      </div>
    )
  })}
</div>

<style>{`
@keyframes flow {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(100%) }
}

@keyframes numberPulse {
  0%,100% { transform: scale(1) }
  50% { transform: scale(1.08) }
}

@keyframes dotPulse {
  0%,100% { transform: translateY(-50%) scale(1) }
  50% { transform: translateY(-50%) scale(1.4) }
}

@keyframes bgShift {
  0%,100% { opacity: .8 }
  50% { opacity: 1 }
}
`}</style>

  {/* ================= REASON ================= */}
  <div style={{
  ...card,
  position: 'relative',
  overflow: 'hidden'
}}>

  {/* 🔴 NỀN NGUY HIỂM */}
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundColor: '#ff0000a3',
    // background: `
    //   radial-gradient(circle at center, rgba(255,50,50,.18), transparent 70%),
    //   linear-gradient(120deg, rgba(255,0,0,.08), transparent),
    //   rgba(0,0,0,.6)
    // `,
    animation: 'dangerBg 4s ease-in-out infinite',
    zIndex: 0
  }} />

  {/* ⚡ VÒNG NĂNG LƯỢNG */}
  <div style={{
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: '50%',
    border: '1px solid rgba(255,80,80,.25)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'pulseRing 2.5s infinite',
    zIndex: 0
  }} />

  {/* 🚨 TITLE */}
  <h3 style={{
    ...cardTitle,
    position: 'relative',
    zIndex: 2,
    color: '#ff8080',
    textShadow: '0 0 12px rgba(255,80,80,.6)'
  }}>
    🚨 Lý do vắng mặt
    <div style={{
      height: 2,
      marginTop: 6,
      width: 90,
      background: 'linear-gradient(90deg, #ff5252, transparent)'
    }} />
  </h3>

  {reasonData.length === 0 ? (
    <div style={{
      textAlign: 'center',
      padding: '60px 0',
      color: 'var(--text-muted)',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{
        fontSize: 46,
        animation: 'okPulse 1.5s infinite'
      }}>
        ✅
      </div>
      Không có vắng mặt
    </div>
  ) : (
    <>
      {/* 📊 PIE */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={reasonData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              isAnimationActive
              animationDuration={800}
            >
              {reasonData.map((_, i) => (
                <Cell
                  key={i}
                  fill={REASON_PALETTE[i % REASON_PALETTE.length]}
                  stroke="rgba(255,255,255,.25)"
                  strokeWidth={1.2}
                />
              ))}
            </Pie>

            <Tooltip contentStyle={{
              ...TOOLTIP_STYLE,
              border: '1px solid rgba(255,80,80,.5)',
              boxShadow: '0 0 20px rgba(255,80,80,.6)',
              borderRadius: 10
            }} />
          </PieChart>
        </ResponsiveContainer>

        {/* 💥 GLOW GIỮA */}
        <div style={{
          position: 'absolute',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,80,80,.35), transparent)',
          filter: 'blur(25px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'centerGlow 2s infinite'
        }} />
      </div>

      {/* 📋 LEGEND SIÊU NỔ */}
      <div style={{
        marginTop: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        zIndex: 2
      }}>
        {reasonData.map((d, i) => (
          <div key={d.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(255,255,255,.03)',
              border: `1px solid ${REASON_PALETTE[i]}33`,
              transition: 'all .2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 12px ${REASON_PALETTE[i]}66`
              e.currentTarget.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <span style={{
              color: REASON_PALETTE[i],
              fontWeight: 600
            }}>
              ● {d.name}
            </span>

            <span style={{
              fontWeight: 800,
              color: '#fff',
              textShadow: `0 0 10px ${REASON_PALETTE[i]}`
            }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </>
  )}

</div>

<style>{`
@keyframes pulseRing {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: .6 }
  70% { transform: translate(-50%, -50%) scale(1.3); opacity: 0 }
  100% { opacity: 0 }
}

@keyframes centerGlow {
  0%,100% { opacity: .4 }
  50% { opacity: 1 }
}

@keyframes dangerBg {
  0%,100% { opacity: .8 }
  50% { opacity: 1 }
}

@keyframes okPulse {
  0%,100% { transform: scale(1) }
  50% { transform: scale(1.15) }
}
`}</style>

  {/* ================= RADAR ================= */}
  <div style={{
  ...card,
  position: 'relative',
  overflow: 'hidden'
}}>

  {/* 🌌 NỀN RADAR */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(circle at center, rgba(0,255,180,.15), transparent 70%),
      repeating-radial-gradient(circle, rgba(0,255,180,.08) 0px, transparent 2px, transparent 40px),
      rgba(0,0,0,.6)
    `,
    zIndex: 0
  }} />

  {/* 🌀 VÒNG PULSE LAN */}
  <div style={{
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    border: '1px solid rgba(0,255,180,.2)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'radarPulse 3s infinite',
    zIndex: 0
  }} />

  {/* 📡 VẠCH QUÉT */}
  <div style={{
    position: 'absolute',
    width: 300,
    height: 300,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'conic-gradient(rgba(0,255,180,.35), transparent 60%)',
      animation: 'radarSweep 2.5s linear infinite'
    }} />
  </div>

  {/* ✨ TITLE */}
  <h3 style={{
    ...cardTitle,
    position: 'relative',
    zIndex: 2
  }}>
    📡 Radar trung đội
    <div style={{
      height: 2,
      marginTop: 6,
      width: 90,
      background: 'linear-gradient(90deg, #00ffae, transparent)'
    }} />
  </h3>

  {/* 📊 CHART */}
  <div style={{ position: 'relative', zIndex: 2 }}>
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={radarData}>

        <PolarGrid
          stroke="rgba(0,255,180,.2)"
          radialLines
        />

        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill: '#00ffcc',
            fontSize: 12,
            fontWeight: 700
          }}
        />

        <Radar
          dataKey="Tỷ lệ % "
          stroke="#00ffae"
          strokeWidth={2.5}
          fill="url(#radarGradient)"
          fillOpacity={0.7}
          dot={{
            r: 4,
            fill: '#000',
            stroke: '#00ffae',
            strokeWidth: 2
          }}
        />

        {/* gradient */}
        <defs>
          <linearGradient id="radarGradient">
            <stop offset="0%" stopColor="#00ffae" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#00ffae" stopOpacity={0.2}/>
          </linearGradient>
        </defs>

        <Tooltip
          contentStyle={{
            ...TOOLTIP_STYLE,
            borderRadius: 10,
            boxShadow: '0 0 20px rgba(0,255,180,.6)',
            border: '1px solid rgba(0,255,180,.4)'
          }}
        />

      </RadarChart>
    </ResponsiveContainer>
  </div>

</div>

{/* 🔥 ANIMATION */}
<style>{`
@keyframes radarSweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes radarPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.6;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
`}</style>

</div>

{/* GLOBAL ANIMATION */}
<style>{`
@keyframes shine {
  from { transform: translateX(-100%) }
  to { transform: translateX(200%) }
}

@keyframes pulse {
  0%,100% { opacity: .4 }
  50% { opacity: 1 }
}
`}</style>
    </div>
  )
}
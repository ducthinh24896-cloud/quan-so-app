/**
 * app/(app)/baocao/page.tsx
 *
 * Trang "Báo cáo nhận" — chỉ Admin và Chỉ huy thấy.
 * Hiển thị danh sách báo cáo điểm danh đã gửi trong ngày.
 * Tự động refresh mỗi 8 giây để xem báo cáo mới nhất (realtime).
 *
 * Mỗi báo cáo hiển thị:
 *  - Tên trung đội + người gửi + giờ gửi
 *  - Tóm tắt: Bộ TĐ có mặt, Chiến sĩ có mặt, tổng vắng
 *  - Danh sách người vắng (tags)
 *  - Ghi chú
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader, LiveDot } from '@/components/ui'
import type { AbsentPerson } from '@/lib/types'

// Kiểu row trả về từ /api/reports
interface ReportRow {
  id:              number
  date:            string
  squad_id:        number
  squad_name:      string
  submitted_by:    string
  submitted_at:    string
  btd_total:       number
  btd_present:     number
  btd_absent:      number
  btd_absent_list: AbsentPerson[]
  cs_total:        number
  cs_present:      number
  cs_absent:       number
  cs_absent_list:  AbsentPerson[]
  note:            string
}

export default function BaoCaoPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
const { isMobile, isTablet } = useResponsive();
  function useResponsive() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile: width < 640,
    isTablet: width < 1024,
  };
}

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data: ReportRow[] = await res.json()
        // Sắp xếp mới nhất lên đầu
        setReports(data.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    const id = setInterval(fetchReports, 8_000)  // refresh mỗi 8 giây
    return () => clearInterval(id)
  }, [fetchReports])

  return (
    <div>
      <PageHeader
        title="Báo cáo nhận"
        subtitle={<><LiveDot />Tự động cập nhật mỗi 8 giây</>}
      />

      {/* Loading */}
      {loading && (
        <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Đang tải...
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div style={{
          background:   'var(--panel)',
          border:       '1px solid var(--border)',
          padding:      '60px 40px',
          textAlign:    'center',
          color:        'var(--text-muted)',
        }}>
          <div style={{ fontSize: isMobile ? 18 : 24, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>Chưa có báo cáo nào hôm nay</div>
          <div style={{ fontSize: isMobile ? 14 : 16, marginTop: 6 }}>Các trung đội chưa gửi điểm danh</div>
        </div>
      )}

      {/* Danh sách báo cáo */}
      {!loading && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
  {reports.map(r => {
    const allAbsent   = [...r.btd_absent_list, ...r.cs_absent_list]
    const totalAbsent = r.btd_absent + r.cs_absent
    const timeStr     = new Date(r.submitted_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const hasNote = r.note && r.note.trim().length > 0

    return (
      <div
        key={r.id}
        style={{
          position: 'relative',
          borderRadius: 10,
         padding: isMobile ? '16px 14px' : '22px 26px',
          background: `
            linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95))
          `,
          border: '1px solid rgba(91,200,245,.2)',
          boxShadow: `
            inset 0 0 20px rgba(91,200,245,.08),
            0 8px 30px rgba(0,0,0,.6)
          `,
          overflow: 'hidden',
          transition: 'all .25s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
          e.currentTarget.style.boxShadow = '0 0 30px rgba(91,200,245,.35)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,.6)'
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top, rgba(91,200,245,0.12), transparent 70%)',
          pointerEvents: 'none',
          opacity: isMobile ? 0.05 : 1,
        }} />

        {/* Scan line */}
        <div style={{
          display: isMobile ? 'none' : 'block',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.12), transparent)',
          animation: 'scanCard 4s linear infinite',
        }} />

        <style>{`
          @keyframes scanCard {
            0% { left: -100% }
            100% { left: 100% }
          }

          @keyframes pulseDanger {
            0% { transform: scale(1); opacity: 1 }
            50% { transform: scale(1.15); opacity: .7 }
            100% { transform: scale(1); opacity: 1 }
          }
        `}</style>

        {/* HEADER */}
        <div style={{
         display: 'flex',
flexDirection: isMobile ? 'column' : 'row',
gap: isMobile ? 10 : 0,
justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{
             fontSize: isMobile ? 18 : 24,
              color: '#5bc8f5',
              textShadow: '0 0 10px rgba(91,200,245,.7)',
            }}>
              ✦
            </span>

            <div>
              <div style={{
               fontSize: isMobile ? 14 : 16,
                fontWeight: 800,
                color: '#5bc8f5',
                letterSpacing: 1.5,
                textShadow: '0 0 8px rgba(91,200,245,.6)',
              }}>
                {r.squad_name}
              </div>

              <div style={{
              fontSize: isMobile ? 14 : 16,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}>
                Báo cáo bởi: <strong style={{ color: '#fff' }}>{r.submitted_by}</strong>
              </div>
            </div>
          </div>

          {/* SỐ VẮNG */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
             fontSize: isMobile ? 11 : 12,
padding: isMobile ? '4px 10px' : '5px 12px',
              fontWeight: 900,
              color: totalAbsent > 0 ? '#ff5252' : '#00e676',
              textShadow: totalAbsent > 0
                ? '0 0 15px rgba(255,82,82,.7)'
                : '0 0 15px rgba(0,230,118,.6)',
              animation: totalAbsent > 0 ? 'pulseDanger 1.2s infinite' : 'none',
            }}>
              {totalAbsent > 0 ? `−${totalAbsent}` : '✔'}
            </div>

            <div style={{
             fontSize: isMobile ? 18 : 24,
              color: '#7ab8d8',
              marginTop: 4,
            }}>
              ⏱ {timeStr}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
        gridTemplateColumns: isMobile
  ? '1fr'
  : isTablet
  ? 'repeat(2,1fr)'
  : 'repeat(3,1fr)',
          gap: 12,
          marginBottom: allAbsent.length > 0 || hasNote ? 16 : 0,
        }}>
          {[
            {
              label: 'Cán bộ',
              value: `${r.btd_present}/${r.btd_total}`,
              bad: r.btd_absent > 0,
            },
            {
              label: 'Chiến sĩ',
              value: `${r.cs_present}/${r.cs_total}`,
              bad: r.cs_absent > 0,
            },
            {
              label: 'Vắng',
              value: totalAbsent,
              bad: totalAbsent > 0,
            },
          ].map(item => (
            <div key={item.label} style={{
              borderRadius: 6,
              padding: '10px 14px',
              background: 'rgba(26,110,168,.12)',
              border: `1px solid ${item.bad ? '#ff525255' : '#00e67655'}`,
              boxShadow: item.bad
                ? '0 0 10px rgba(255,82,82,.25)'
                : '0 0 10px rgba(0,230,118,.25)',
            }}>
              <div style={{
               fontSize: isMobile ? 14 : 16,
                color: 'var(--text-muted)',
                letterSpacing: 1.5,
              }}>
                {item.label}
              </div>

              <div style={{
               fontSize: isMobile ? 18 : 24,
                fontWeight: 800,
                color: item.bad ? '#ff5252' : '#00e676',
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* DANH SÁCH VẮNG */}
        {allAbsent.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: hasNote ? 12 : 0,
          }}>
            {allAbsent.map((p, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                fontSize: isMobile ? 18 : 24,
                  background: 'rgba(255,82,82,.15)',
                  border: '1px solid rgba(255,82,82,.4)',
                  color: '#ffb3b3',
                  boxShadow: '0 0 8px rgba(255,82,82,.3)',
                }}
              >
                👤 <strong>{p.name || '---'}</strong>
                · {p.position}
                · <span style={{ color: '#ffd166' }}>{p.reason}</span>
              </span>
            ))}
          </div>
        )}

        {/* NOTE */}
        {hasNote && (
          <div style={{
       fontSize: isMobile ? 12 : 13,
            color: '#9ecfe8',
            fontStyle: 'italic',
            borderTop: '1px solid rgba(255,255,255,.08)',
            paddingTop: 12,
          }}>
            📝 {r.note}
          </div>
        )}
      </div>
    )
  })}
</div>
      )}

      {/* Footer — số báo cáo */}
      {!loading && reports.length > 0 && (
        <div style={{
          marginTop:  20,
         fontSize: isMobile ? 14 : 16,
          color:      'var(--text-muted)',
          textAlign:  'center',
        }}>
          Hiển thị {reports.length}/4 báo cáo hôm nay
        </div>
      )}
    </div>
  )
}
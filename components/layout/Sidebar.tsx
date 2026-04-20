'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/SessionContext'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '▦', label: 'Tổng quan', roles: ['admin', 'chihuy', 'trungdoi'] },
  { href: '/diemdanh', icon: '✎', label: 'Điểm danh', roles: ['admin', 'trungdoi'] },
  { href: '/baocao', icon: '◉', label: 'Báo cáo nhận', roles: ['admin', 'chihuy'] },
  { href: '/thongke', icon: '▲', label: 'Thống kê', roles: ['admin', 'chihuy'] },
  { href: '/quanly', icon: '⚙', label: 'Quản lý tài khoản', roles: ['admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { session } = useSession()

  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const visible = NAV_ITEMS.filter(n => session && n.roles.includes(session.role))

  return (
    <>
      {/* 🔘 BUTTON MOBILE */}
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            position: 'fixed',
            top: 70,
            left: 12,
            zIndex: 200,
            background: '#cd3f30',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 10px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,.4)'
          }}
        >
          ☰
        </button>
      )}

      {/* 🔥 OVERLAY MOBILE */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 150
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside  style={{
        position: 'fixed',
        left: isMobile ? (open ? 0 : -240) : 0,
        top: 58,
        bottom: 0,
        width: 224,
        backgroundColor: '#cd3f30',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 160,
        overflowY: 'auto',
        transition: 'left .3s ease'
      }}>

        {/* NAV */}
        <nav style={{
          padding: '16px 0',
          flex: 1,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{
            padding: '0 16px 10px',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 2.5,
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>
            Điều hướng
          </div>

          {visible.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 20px',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--sky-bright)' : 'rgba(234,246,253,.55)',
                  background: active ? 'rgba(91,200,245,.08)' : 'transparent',
                  borderLeft: `3px solid ${active ? 'var(--sky-bright)' : 'transparent'}`,
                  transition: 'all .15s',
                }}
              >
                <span style={{
                  fontSize: 16,
                  width: 22,
                  textAlign: 'center',
                  opacity: active ? 1 : 0.7
                }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
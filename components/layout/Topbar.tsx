'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionContext'

const ROLE_LABEL: Record<string, string> = {
  admin:    'ADMIN',
  chihuy:   'CHỈ HUY',
  trungdoi: 'TRUNG ĐỘI',
}

export default function Topbar() {
  const { session } = useSession()
  const router = useRouter()
  const [clock, setClock] = useState('')
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

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{
      // background: 'var(--sky-dark)',
      backgroundColor: '#cd3f30',
  //      backgroundImage: `
  //   radial-gradient(circle at 20% 20%, rgba(91,200,245,.25), transparent 40%),
  //   radial-gradient(circle at 80% 0%, rgba(0,255,170,.2), transparent 40%),
  //   linear-gradient(rgba(7,25,43,.92), rgba(7,25,43,.98)),
  //   url('/imges/bg.jpg')
  // `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderBottom: '1px solid rgba(91,200,245,.25)',
  boxShadow: '0 4px 30px rgba(0,0,0,.6)',
  backdropFilter: 'blur(10px)',
 padding: isMobile ? '0 12px' : '0 24px',
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 200,
    }}>
      {/* Brand */}
     <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
  <span style={{
    fontSize: 28,
    color: '#5bc8f5',
    textShadow: '0 0 10px #5bc8f5, 0 0 25px #5bc8f5',
    animation: 'pulseGlow 2s infinite alternate'
  }}>
    ✦
  </span>

<div>
  <div style={{
    fontSize: isMobile ? 13 : 16,
    fontWeight: 900,
    letterSpacing: isMobile ? 1.5 : 3,
    color: '#5bc8f5',
    textTransform: 'uppercase',
    textShadow: '0 0 8px rgba(91,200,245,.8)'
  }}>
    Báo cáo Quân số
  </div>

  {!isMobile && (
    <div style={{
      fontSize: 10,
      color: 'rgba(234,246,253,.5)',
      letterSpacing: 2
    }}>
      ĐẠI ĐỘI 7
    </div>
  )}
</div>
</div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center',gap: isMobile ? 8 : 16, }}>
        {/* Clock */}
       <span style={{
  fontFamily: 'monospace',
  fontSize: 15,
  color: '#00ffaa',
  letterSpacing: 2,
  textShadow: '0 0 8px #00ffaa'
}}>
  {clock}
</span>

        {/* User badge */}
        {session &&  !isMobile && (
        <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 16px',
  borderRadius: 6,
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(91,200,245,.4)',
  boxShadow: '0 0 15px rgba(91,200,245,.3)',
  backdropFilter: 'blur(6px)',
}}>
  <span style={{
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    color: '#5bc8f5',
  }}>
    {ROLE_LABEL[session.role]}
  </span>

  <span style={{
    width: 1,
    height: 14,
    background: 'rgba(255,255,255,.2)'
  }} />

  <span style={{
    fontSize: 13,
    color: '#fff'
  }}>
    {session.name}
  </span>
</div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: '1px solid rgba(192,57,43,.5)',
            color: '#ff8080',
           padding: isMobile ? '5px 10px' : '6px 14px',
fontSize: isMobile ? 11 : 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: 4,
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
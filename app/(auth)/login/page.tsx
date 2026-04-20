/**
 * app/(auth)/login/page.tsx
 *
 * Trang đăng nhập.
 * - Form username + password
 * - Gọi POST /api/auth/login
 * - Nếu thành công → redirect về /dashboard
 * - Hiển thị lỗi nếu sai tài khoản
 * - Hiển thị danh sách tài khoản demo để tiện test
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password }),
      })

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Đăng nhập thất bại')
      }
    } catch {
      setError('Không thể kết nối server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Shared input style
  const inputStyle: React.CSSProperties = {
    width:        '100%',
    background:   'rgba(26,110,168,.1)',
    border:       '1px solid rgba(26,110,168,.35)',
    padding:      '12px 14px',
    color:        '#eaf6fd',
    fontSize:     15,
    borderRadius: 3,
    outline:      'none',
    fontFamily:   'inherit',
    transition:   'border-color .2s',
  }

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         '#7ab8d8',
    marginBottom:  8,
  }


  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      background:      'linear-gradient(135deg, #020c18 0%, #071929 60%, #020c18 100%)',
      position:        'relative',
      overflow:        'hidden',
      padding:         '24px',
    }}>
      {/* Grid overlay */}
      <div style={{
        position:        'absolute',
        inset:           0,
        pointerEvents:   'none',
        backgroundImage: `
          repeating-linear-gradient(0deg,  transparent, transparent 49px, rgba(26,110,168,.09) 50px),
          repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(26,110,168,.09) 50px)
        `,
      }} />

      {/* Glow effect */}
      <div style={{
        position:    'absolute',
        top:         '35%',
        left:        '50%',
        transform:   'translate(-50%, -50%)',
        width:        700,
        height:       700,
        background:   'radial-gradient(circle, rgba(26,110,168,.1) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div style={{
        background:   '#0c2440',
        border:       '1px solid rgba(26,110,168,.35)',
        borderTop:    '4px solid #5bc8f5',
        padding:      '48px 44px',
        width:        '100%',
        maxWidth:     420,
        position:     'relative',
        boxShadow:    '0 28px 90px rgba(0,0,0,.75)',
        animation:    'fadeIn .4s ease',
      }}>
        {/* Emblem */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize:  56,
            color:     '#5bc8f5',
            lineHeight: 1,
            marginBottom: 10,
            animation: 'pulse 3s ease-in-out infinite',
          }}>
            ✦
          </div>
          <style>{`
            @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.93)} }
            @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
          `}</style>

          <h1 style={{
            fontSize:      20,
            fontWeight:    800,
            letterSpacing: 4,
            color:         '#5bc8f5',
            textTransform: 'uppercase',
            margin:        0,
          }}>
            Báo cáo Quân số
          </h1>
          <p style={{
            fontSize:      11,
            letterSpacing: 3,
            color:         '#7ab8d8',
            marginTop:     6,
            textTransform: 'uppercase',
          }}>
            Hệ thống quản lý đại đội
          </p>
          <div style={{
            width:     56,
            height:    2,
            background: '#1a6ea8',
            margin:    '14px auto 0',
          }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập username..."
              autoComplete="username"
              autoFocus
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#5bc8f5'}
              onBlur={e  => e.target.style.borderColor = 'rgba(26,110,168,.35)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoComplete="current-password"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#5bc8f5'}
              onBlur={e  => e.target.style.borderColor = 'rgba(26,110,168,.35)'}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background:   'rgba(192,57,43,.18)',
              border:       '1px solid rgba(192,57,43,.4)',
              color:        '#ff8080',
              padding:      '10px 14px',
              fontSize:     13,
              borderRadius: 3,
              marginBottom: 18,
              display:      'flex',
              alignItems:   'center',
              gap:          8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width:         '100%',
              background:    loading ? '#0d3d62' : '#1a6ea8',
              border:        'none',
              padding:       '14px',
              color:         '#eaf6fd',
              fontSize:      14,
              fontWeight:    800,
              letterSpacing: 3,
              textTransform: 'uppercase',
              cursor:        loading ? 'not-allowed' : 'pointer',
              borderRadius:  3,
              transition:    'background .2s',
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'center',
              gap:            10,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3a9bd5' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1a6ea8' }}
          >
            {loading && (
              <span style={{
                display:      'inline-block',
                width:        16,
                height:       16,
                border:       '2px solid rgba(255,255,255,.3)',
                borderTop:    '2px solid #fff',
                borderRadius: '50%',
                animation:    'spin .7s linear infinite',
              }} />
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

     
      </div>
    </div>
  )
}
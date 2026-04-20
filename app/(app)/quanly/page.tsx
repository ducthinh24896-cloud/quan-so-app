/**
 * app/(app)/quanly/page.tsx
 *
 * Trang Quản lý — chỉ Admin thấy.
 * Hiển thị:
 *  1. Bảng tài khoản hệ thống (7 tài khoản cố định)
 *  2. Bảng cấu hình 4 trung đội (quân số, tổng)
 *  3. Hướng dẫn sử dụng hệ thống
 */

'use client'

import { PageHeader, TableCard, Badge } from '@/components/ui'

// ── Dữ liệu tĩnh (cấu hình hệ thống) ────────────────────────────────────────

const ACCOUNTS = [
  {
    username: 'admin',
    name:     'Đại đội trưởng',
    role:     'admin' as const,
    squad:    'Toàn đại đội',
    password: 'admin123',
  },
  {
    username: 'chihuy1',
    name:     'Chính trị viên',
    role:     'chihuy' as const,
    squad:    'Toàn đại đội',
    password: 'chihuy1',
  },
  {
    username: 'chihuy2',
    name:     'Đại đội phó',
    role:     'chihuy' as const,
    squad:    'Toàn đại đội',
    password: 'chihuy2',
  },
  {
    username: 'trungdoi1',
    name:     'TĐT Trung đội 1',
    role:     'trungdoi' as const,
    squad:    'Trung đội 1',
    password: 'td1pass',
  },
  {
    username: 'trungdoi2',
    name:     'TĐT Trung đội 2',
    role:     'trungdoi' as const,
    squad:    'Trung đội 2',
    password: 'td2pass',
  },
  {
    username: 'trungdoi3',
    name:     'TĐT Trung đội 3',
    role:     'trungdoi' as const,
    squad:    'Trung đội 3',
    password: 'td3pass',
  },
  {
    username: 'trungdoi4',
    name:     'TĐT Trung đội 4',
    role:     'trungdoi' as const,
    squad:    'Trung đội 4',
    password: 'td4pass',
  },
]

const SQUADS = [
  { id: 1, name: 'Trung đội 1', btd: 5,  cs: 25 },
  { id: 2, name: 'Trung đội 2', btd: 5,  cs: 24 },
  { id: 3, name: 'Trung đội 3', btd: 5,  cs: 26 },
  { id: 4, name: 'Trung đội 4', btd: 4,  cs: 22 },
]

const ROLE_BADGE_VARIANT = {
  admin:    'admin',
  chihuy:   'chihuy',
  trungdoi: 'trungdoi',
} as const

const ROLE_LABEL = {
  admin:    'Admin',
  chihuy:   'Chỉ huy',
  trungdoi: 'Trung đội',
}

const GUIDELINES = [
  { role: 'Admin',    desc: 'Toàn quyền: xem tổng quan, điểm danh cho mọi trung đội, xem báo cáo nhận, thống kê, quản lý tài khoản.' },
  { role: 'Chỉ huy', desc: 'Xem tổng quan, điểm danh cho mọi trung đội, xem báo cáo nhận, thống kê. Không thấy trang Quản lý.' },
  { role: 'Trung đội', desc: 'Chỉ thấy Tổng quan và Điểm danh. Chỉ được nhập điểm danh cho trung đội mình. Không xem được báo cáo của trung đội khác.' },
]


// ── Component ─────────────────────────────────────────────────────────────────

export default function QuanLyPage() {
  const totalBtd = SQUADS.reduce((s, x) => s + x.btd, 0)
  const totalCs  = SQUADS.reduce((s, x) => s + x.cs,  0)
  const totalAll = totalBtd + totalCs

  return (
    <div>
      <PageHeader
        title="Quản lý"
        subtitle="Tài khoản hệ thống & cấu hình đơn vị"
      />

      {/* ── Bảng tài khoản ── */}
      <TableCard title="Tài khoản hệ thống">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Họ tên / Chức danh</th>
              <th>Vai trò</th>
              <th>Phụ trách</th>
              <th>Mật khẩu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((acc, idx) => (
              <tr key={acc.username}>
                <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{idx + 1}</td>
                <td>
                  <code style={{
                    background:   'rgba(26,110,168,.15)',
                    border:       '1px solid var(--border)',
                    padding:      '2px 8px',
                    borderRadius: 3,
                    fontSize:     13,
                    color:        'var(--sky-bright)',
                    fontFamily:   'monospace',
                  }}>
                    {acc.username}
                  </code>
                </td>
                <td style={{ fontWeight: 500 }}>{acc.name}</td>
                <td>
                  <Badge variant={ROLE_BADGE_VARIANT[acc.role]}>
                    {ROLE_LABEL[acc.role]}
                  </Badge>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{acc.squad}</td>
                <td>
                  <code style={{
                    background:   'rgba(26,110,168,.1)',
                    border:       '1px solid var(--border)',
                    padding:      '2px 8px',
                    borderRadius: 3,
                    fontSize:     13,
                    color:        'var(--text-muted)',
                    fontFamily:   'monospace',
                  }}>
                    {acc.password}
                  </code>
                </td>
                <td>
                  <Badge variant="present">Hoạt động</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      {/* ── Bảng cấu hình trung đội ── */}
      <TableCard title="Cấu hình trung đội">
        <table>
          <thead>
            <tr>
              <th>Trung đội</th>
              <th>Bộ trung đội (cán bộ)</th>
              <th>Chiến sĩ</th>
              <th>Tổng quân số</th>
              <th>Tỷ trọng</th>
            </tr>
          </thead>
          <tbody>
            {SQUADS.map(sq => {
              const total  = sq.btd + sq.cs
              const pct    = Math.round((total / totalAll) * 100)
              return (
                <tr key={sq.id}>
                  <td>
                    <strong style={{ color: 'var(--sky-bright)' }}>{sq.name}</strong>
                  </td>
                  <td>{sq.btd} người</td>
                  <td>{sq.cs} người</td>
                  <td>
                    <strong style={{ fontSize: 15 }}>{total} người</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width:       100,
                        height:      7,
                        background:  'rgba(26,110,168,.2)',
                        borderRadius: 4,
                        overflow:    'hidden',
                      }}>
                        <div style={{
                          height:     '100%',
                          width:      `${pct}%`,
                          background: 'var(--sky)',
                          borderRadius: 4,
                        }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 32 }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Tổng */}
            <tr style={{
              background:  'rgba(91,200,245,.05)',
              borderTop:   '2px solid var(--border)',
            }}>
              <td>
                <strong style={{ color: 'var(--sky-bright)', fontSize: 14 }}>TỔNG CỘNG</strong>
              </td>
              <td><strong>{totalBtd} người</strong></td>
              <td><strong>{totalCs} người</strong></td>
              <td>
                <strong style={{ fontSize: 17, color: 'var(--sky-bright)' }}>
                  {totalAll} người
                </strong>
              </td>
              <td>
                <Badge variant="submitted">100%</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </TableCard>

      {/* ── Hướng dẫn sử dụng ── */}
      <div style={{
        background:   'rgba(26,110,168,.07)',
        border:       '1px solid rgba(26,110,168,.25)',
        padding:      '22px 26px',
        borderRadius: 3,
        marginBottom: 20,
      }}>
        <div style={{
          fontSize:      12,
          fontWeight:    700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color:         'var(--sky-bright)',
          marginBottom:  16,
        }}>
          Hướng dẫn sử dụng
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GUIDELINES.map(g => (
            <div key={g.role} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
              <span style={{
                fontWeight:    700,
                color:         'var(--sky-bright)',
                minWidth:      80,
                flexShrink:    0,
              }}>
                {g.role}:
              </span>
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{g.desc}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop:   18,
          paddingTop:  14,
          borderTop:   '1px solid var(--border)',
          fontSize:    13,
          color:       'var(--text-muted)',
          lineHeight:  1.8,
        }}>
          <div>
            📁 Database SQLite lưu tại:
            <code style={{ color: 'var(--sky-bright)', marginLeft: 6, padding: '1px 6px', background: 'rgba(26,110,168,.15)', borderRadius: 3 }}>
              data/quan_so.db
            </code>
          </div>
          <div>
            🔐 Session JWT, hết hạn sau <strong>8 giờ</strong>, lưu trong httpOnly cookie.
          </div>
          <div>
            🔄 Dashboard và Thống kê tự động cập nhật mỗi <strong>10 giây</strong>. Báo cáo nhận mỗi <strong>8 giây</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
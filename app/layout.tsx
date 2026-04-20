import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hệ thống Báo cáo Quân số',
  description: 'Quản lý điểm danh và báo cáo quân số đại đội — 4 trung đội',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
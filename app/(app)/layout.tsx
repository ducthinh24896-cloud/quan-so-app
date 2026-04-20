/**
 * app/(app)/layout.tsx
 *
 * Layout áp dụng cho tất cả trang sau khi đăng nhập:
 * dashboard, diemdanh, baocao, thongke, quanly
 *
 * Bao gồm:
 *  - SessionProvider  : cung cấp auth context cho toàn app
 *  - Topbar           : thanh header cố định phía trên
 *  - Sidebar          : menu điều hướng bên trái (width 220px)
 *  - main             : vùng nội dung chính
 */

"use client";

import { SessionProvider } from "@/components/SessionContext";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import '../responsive.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsive();
  function useResponsive() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width < 1024,
  };
}
  return (
    <SessionProvider>
      {/* Topbar cố định trên cùng, cao 58px */}
      <Topbar />

      <div style={{ display: "flex" }}>
        {/* Sidebar cố định bên trái, rộng 220px */}
        <Sidebar />

        {/* Vùng nội dung chính — margin-left 220px để tránh Sidebar */}
     <main  className="main-content" style={{
   marginLeft: isMobile ? 0 : 220,
    padding: isMobile ? "20px 14px 30px" : "30px 32px 40px",
    minHeight: "calc(100vh - 58px)",
    width: isMobile ? "100%" : "calc(100% - 220px)",
    position: "relative",
    overflow: "hidden",
    overflowX: "hidden", // 🔥 thêm dòng này
     contain: "paint", // 🔥 CỰC QUAN TRỌNG
}}>
  {/* background image */}
  <div
 style={{
  position: "absolute",
  inset: 0,

  background: `
    radial-gradient(circle at 20% 20%, rgba(240, 14, 14, 1), transparent 45%),
  linear-gradient(120deg, #ecca08ff, #ff8f00, #f35805ff)
  `,

  backgroundSize: "200% 200%",
  animation: "gradientMove 6s ease infinite",

  zIndex: 0,
}}
  />

  {/* overlay nhẹ thôi */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(135deg, rgba(7,25,43,.35), rgba(7,25,43,.55))",
      zIndex: 1,
    }}
  />

  {/* content */}
  <div style={{ position: "relative", zIndex: 2 }}>
    {children}
  </div>
</main>
        {/* ánh sáng chạy */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,.06), transparent)",
            animation: "shineMain 6s linear infinite",
          display: isMobile ? "none" : "block",
          }}
        />

        {/* scan line kiểu radar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,.03) 0px, transparent 2px)",
            opacity: 0.2,
           display: isMobile ? "none" : "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -100,
          left: "-20%",
width: 200,
maxWidth: "40vw",
            height: 300,
            background:
              "radial-gradient(circle, rgba(91,200,245,.3), transparent)",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -120,
           right: "-20%",
width: 200,
maxWidth: "40vw",
            height: 300,
            background:
              "radial-gradient(circle, rgba(0,255,174,.25), transparent)",
            filter: "blur(90px)",
          }}
        />
       <style>{`@keyframes gradientMove {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}`}</style>
      </div>
    </SessionProvider>
  );
}

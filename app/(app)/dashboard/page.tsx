/**
 * app/(app)/dashboard/page.tsx
 *
 * Trang tổng quan đại đội:
 *  - 4 StatCard: tổng quân số, có mặt, vắng, số trung đội đã báo
 *  - Biểu đồ tròn (Pie): tỷ lệ có mặt / vắng toàn đại đội
 *  - Biểu đồ cột (Bar): so sánh quân số 4 trung đội
 *  - Bảng trạng thái báo cáo từng trung đội
 *  - Tự động refresh mỗi 10 giây (realtime)
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  StatCard,
  PageHeader,
  TableCard,
  Badge,
  LiveDot,
} from "@/components/ui";
import type { DailyStats } from "@/lib/types";
import {
  collection,
  getDocs,
  query, // ✅ thêm dòng này
  where, // ✅ thêm dòng này
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// Màu cho biểu đồ
const PIE_COLORS = ["#1a6ea8", "#c0392b"];
const TOOLTIP_STYLE = {
  background: "#0c2440",
  border: "1px solid rgba(26,110,168,.4)",
  color: "#eaf6fd",
  fontSize: 13,
  borderRadius: 4,
};
const TICK_STYLE = { fill: "#7ab8d8", fontSize: 13 };

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [absentList, setAbsentList] = useState<any[]>([]);
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10_000); // refresh mỗi 10s
    return () => clearInterval(id);
  }, [fetchStats]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: "var(--text-muted)",
          gap: 12,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 20,
            height: 20,
            border: "2px solid rgba(91,200,245,.25)",
            borderTop: "2px solid var(--sky-bright)",
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ color: "var(--text-muted)", padding: 40 }}>
        Không thể tải dữ liệu.
      </div>
    );
  }

  // Dữ liệu biểu đồ tròn
  const pctPresent =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const pieData = [
    { name: `Có mặt (${pctPresent}%)`, value: stats.present },
    { name: `Vắng mặt (${100 - pctPresent}%)`, value: stats.absent },
  ];

  // Dữ liệu biểu đồ cột
  const barData = stats.squads.map((s) => ({
    name: s.name.replace("Trung đội ", "TĐ "),
    "Có mặt": s.present,
    Vắng: s.absent,
  }));

  const fetchAbsentList = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const q = query(collection(db, "reports"), where("date", "==", today));

    const snap = await getDocs(q);

    const result: any[] = [];

    snap.forEach((doc) => {
      const data = doc.data();

      const squadName = data.squad_name;

      // bộ trung đội
      (data.btd_absent_list || []).forEach((p: any) => {
        result.push({
          squad: squadName,
          ...p,
        });
      });

      // chiến sĩ
      (data.cs_absent_list || []).forEach((p: any) => {
        result.push({
          squad: squadName,
          ...p,
        });
      });
    });

    setAbsentList(result);
  };
  function CountUp({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 500;
      const step = Math.ceil(value / (duration / 16));

      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          start = value;
          clearInterval(interval);
        }
        setDisplay(start);
      }, 16);

      return () => clearInterval(interval);
    }, [value]);

    return <>{display}</>;
  }
  const cardWrap = (gradient: string): React.CSSProperties => ({
    borderRadius: 14,
    background: gradient,
    padding: 2,
    position: "relative",
    overflow: "hidden",

    boxShadow: "0 0 20px rgba(0,0,0,.6)",

    transition: "all .35s ease",
  });

  const cardInner: React.CSSProperties = {
    // background: 'var(--bg-panel)',
    borderRadius: 10,
    padding: 6,
    height: "100%",
  };
  const chartCard = (): React.CSSProperties => ({
    background: `
    linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95))
  `,
    borderRadius: 12,
    padding: "26px 22px",
    position: "relative",

    border: "1px solid rgba(91,200,245,.2)",

    boxShadow: `
    inset 0 0 20px rgba(91,200,245,.08),
    0 10px 40px rgba(0,0,0,.6)
  `,
  });
  const glowOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top, rgba(91,200,245,0.15), transparent 70%)",
    pointerEvents: "none",
  };

  const shineOverlay = {
    content: '""',
    position: "absolute" as const,
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(120deg, transparent, rgba(255,255,255,.25), transparent)",
    animation: "shineCard 3s linear infinite",
  };

  return (
    <div>
      {/* ── Header ── */}
      <PageHeader
        title="Tổng quan đại đội"
        subtitle={
          <>
            <LiveDot />
            Tự động cập nhật mỗi 10 giây
          </>
        }
      />

      {/* ── 4 Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
              ? "repeat(2,1fr)"
              : "repeat(4,1fr)",
          gap: 18,
          marginBottom: 30,
        }}
      >
        {/* 🟡 Tổng quân số */}
        <div
          style={cardWrap("linear-gradient(135deg,#5bc8f5,#1a6ea8)")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px) scale(1.04)";
            e.currentTarget.style.boxShadow = `
    0 0 30px rgba(91,200,245,.6),
    0 0 60px rgba(91,200,245,.3)
  `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={shineOverlay} />
          <div style={cardInner}>
            <StatCard
              label="🎯 Tổng quân số"
              // value={<CountUp value={stats.total} />}
              value={<CountUp value={164} />}
              sub="Toàn đại đội (4 trung đội)"
              accent="highlight"
            />
          </div>
        </div>

        {/* 🟢 Có mặt */}
        <div
          style={cardWrap("linear-gradient(135deg,#00e676,#00c853)")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px) scale(1.04)";
            e.currentTarget.style.boxShadow = `
    0 0 30px rgba(91,200,245,.6),
    0 0 60px rgba(91,200,245,.3)
  `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={shineOverlay} />
          <div style={cardInner}>
            <StatCard
              label="✅ Có mặt"
              value={<CountUp value={stats.present} />}
              sub={`${pctPresent}% quân số`}
              accent="success"
            />
          </div>
        </div>

        {/* 🔴 Vắng mặt (CỰC NỔI + PULSE) */}
        <div
          onClick={async () => {
            await fetchAbsentList();
            setOpenModal(true);
          }}
          style={{
            ...cardWrap("linear-gradient(135deg,#ff5252,#ff1744,#ff9100)"),
            cursor: "pointer",
            animation: stats.absent > 0 ? "pulseDanger 1.2s infinite" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px) scale(1.04)";
            e.currentTarget.style.boxShadow = `
    0 0 30px rgba(91,200,245,.6),
    0 0 60px rgba(91,200,245,.3)
  `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={shineOverlay} />
          <div style={cardInner}>
            <StatCard
              label="⚠️ Vắng mặt"
              value={<CountUp value={stats.absent} />}
              sub={`${100 - pctPresent}% quân số`}
              accent="danger"
            />
          </div>
        </div>

        {/* 🔵 Đã báo cáo */}
        <div
          style={cardWrap("linear-gradient(135deg,#2979ff,#00b0ff)")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px) scale(1.04)";
            e.currentTarget.style.boxShadow = `
    0 0 30px rgba(91,200,245,.6),
    0 0 60px rgba(91,200,245,.3)
  `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={cardInner}>
            <StatCard
              label="📡 Đã báo cáo"
              value={stats.reportedCount}
              sub="Trung đội đã gửi báo cáo"
              accent="default"
            />
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
              ? "1fr"
              : "360px 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Pie chart */}
        <div
          style={{
            position: "relative",
            borderRadius: 14,
            padding: "26px 22px",
            // background: `
            //   linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95))
            // `,
            backgroundColor: "#f1f166",
            border: "1px solid rgba(91,200,245,.2)",
            boxShadow: `
      inset 0 0 25px rgba(91,200,245,.08),
      0 10px 40px rgba(0,0,0,.6)
    `,
            overflow: "hidden",
          }}
        >
          {/* Glow nền */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(91,200,245,0.15), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Radar scan xoay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(from 0deg, rgba(91,200,245,0.25), transparent 40%)",
              animation: "radarSpin 4s linear infinite",
              opacity: 0.25,
            }}
          />

          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(120deg, transparent, rgba(255,255,255,.15), transparent)",
              animation: "scanPie 3s linear infinite",
            }}
          />

          <style>{`
    @keyframes radarSpin {
      0% { transform: rotate(0deg) }
      100% { transform: rotate(360deg) }
    }

    @keyframes scanPie {
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
              textTransform: "uppercase",
              color: "#0e24ecff",
              marginBottom: 20,
              textShadow: "0 0 10px rgba(91,200,245,.7)",
            }}
          >
            🎯 Tỷ lệ có mặt toàn đại đội
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {/* Gradient xanh */}
                <radialGradient id="presentPie" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#00e676" stopOpacity={1} />
                  <stop offset="100%" stopColor="#00c853" stopOpacity={0.7} />
                </radialGradient>

                {/* Gradient đỏ */}
                <radialGradient id="absentPie" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#ff5252" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d32f2f" stopOpacity={0.7} />
                </radialGradient>
              </defs>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 60 : 80}
                outerRadius={isMobile ? 90 : 115}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive
                animationDuration={900}
              >
                {pieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? "url(#presentPie)" : "url(#absentPie)"}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#0c2440",
                  border: "1px solid rgba(91,200,245,.4)",
                  borderRadius: 6,
                  color: "#eaf6fd",
                  fontSize: 13,
                  boxShadow: "0 0 15px rgba(91,200,245,.3)",
                }}
              />

              <Legend
                wrapperStyle={{
                  color: "#9ecfe8",
                  fontSize: 13,
                  paddingTop: 10,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* HUD CENTER */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                color:
                  pctPresent >= 95
                    ? "#000fe6ff"
                    : pctPresent >= 85
                      ? "#09a9eeff"
                      : "#e70f0fff",
                textShadow: `
          0 0 10px rgba(91,200,245,.8),
          0 0 20px rgba(91,200,245,.6),
          0 0 40px rgba(91,200,245,.4)
        `,
                animation: "pulseText 1.5s ease-in-out infinite",
              }}
            >
              {pctPresent}%
            </div>

            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#0b2be0ff",
                marginTop: 4,
              }}
            >
              HIỆN DIỆN
            </div>
          </div>

          <style>{`
    @keyframes pulseText {
      0% { transform: scale(1); opacity: 1 }
      50% { transform: scale(1.05); opacity: .85 }
      100% { transform: scale(1); opacity: 1 }
    }
  `}</style>
        </div>

        {/* Bar chart */}
        <div
          style={{
            position: "relative",
            borderRadius: 14,
            padding: "26px 22px",
            // background: `
            //   linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95))
            // `,
            backgroundColor: "#e29200ed",
            border: "1px solid rgba(91,200,245,.2)",
            boxShadow: `
      inset 0 0 20px rgba(91,200,245,.08),
      0 10px 40px rgba(0,0,0,.6)
    `,
            overflow: "hidden",
          }}
        >
          {/* Glow overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top, rgba(91,200,245,0.15), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Light scan */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(120deg, transparent, rgba(255,255,255,.15), transparent)",
              animation: "scanBar 4s linear infinite",
            }}
          />

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
              textTransform: "uppercase",
              color: "#0702ffff",
              marginBottom: 20,
              textShadow: "0 0 10px rgba(91,200,245,.6)",
            }}
          >
            📊 Quân số theo trung đội
          </h3>

          <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
            <BarChart data={barData} barCategoryGap="28%">
              <defs>
                {/* Gradient xanh */}
                <linearGradient id="greenBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e600ff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#00e600ea" stopOpacity={0.6} />
                </linearGradient>

                {/* Gradient đỏ */}
                <linearGradient id="redBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5252" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d32f2f" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="name"
                tick={{ fill: "#0e23e6ff", fontSize: 13 }}
                axisLine={{ stroke: "rgba(91,200,245,.3)" }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#0e23e6ff", fontSize: 13 }}
                axisLine={{ stroke: "rgba(91,200,245,.3)" }}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(91,200,245,.08)" }}
                contentStyle={{
                  background: "#0c2440",
                  border: "1px solid rgba(91,200,245,.4)",
                  borderRadius: 6,
                  color: "#eaf6fd",
                  fontSize: 13,
                  boxShadow: "0 0 15px rgba(91,200,245,.3)",
                }}
              />

              <Legend
                wrapperStyle={{
                  color: "#9ecfe8",
                  fontSize: 13,
                  paddingTop: 10,
                }}
              />

              {/* Có mặt */}
              <Bar
                dataKey="Có mặt"
                fill="url(#greenBar)"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                onMouseEnter={(e: any) => {
                  if (e?.target) {
                    e.target.style.filter = "brightness(1.3)";
                  }
                }}
                onMouseLeave={(e: any) => {
                  if (e?.target) {
                    e.target.style.filter = "none";
                  }
                }}
                label={{
                  position: "top",
                  fill: "#00e676",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />

              {/* Vắng */}
              <Bar
                dataKey="Vắng"
                fill="url(#redBar)"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                label={{
                  position: "top",
                  fill: "#ff5252",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bảng trạng thái ── */}
      <TableCard title="Trạng thái báo cáo hôm nay">
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: isMobile ? 500 : 700, // 👈 fix chính
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#0ff10fbd" }}>
                <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Trung đội</th>
                {!isMobile && <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Người báo cáo</th>}
                <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Bộ TĐ</th>
                {!isMobile && <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Chiến sĩ</th>}
                <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Tổng có mặt</th>
                <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Vắng mặt</th>
                {!isMobile && <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Trạng thái</th>}
                {!isMobile && <th style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13, color: "white" }}>Thời gian</th>}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "#e16610" }}>
              {stats.squads.map((sq) => (
                <tr
                  key={sq.id}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91,200,245,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td  style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13 }}>
                    <strong style={{ color: "var(--sky-bright)" }}>
                      {sq.name}
                    </strong>
                  </td>
                  {!isMobile && (
                    <td style={{ color: "var(--text-muted)" }}>
                      Trung Trưởng {sq.name ?? "—"}
                    </td>
                  )}
                  <td  style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13 }}>
                    <span
                      style={{
                        color: sq.btd.absent > 0 ? "#ff8080" : "#5ddf8a",
                      }}
                    >
                      {sq.btd.present}/{sq.btd.total}
                    </span>
                  </td>
                  {!isMobile && (
                    <td  style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13 }}>
                      <span
                        style={{
                          color: sq.cs.absent > 0 ? "#ff8080" : "#5ddf8a",
                        }}
                      >
                        {sq.cs.present}/{sq.cs.total}
                      </span>
                    </td>
                  )}
                  <td style={{ fontWeight: 600 }}>
                    {sq.present}/{sq.total}
                  </td>
                  <td  style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13 }}>
                    {sq.absent > 0 ? (
                      <span style={{ color: "#ff8080", fontWeight: 700 }}>
                        {sq.absent}
                      </span>
                    ) : (
                      <span style={{ color: "#5ddf8a" }}>0</span>
                    )}
                  </td>
                  {!isMobile && (
                    <td  style={{ padding: isMobile ? "6px" : "10px", fontSize: isMobile ? 11 : 13 }}>
                      {sq.reported ? (
                        <Badge variant="submitted">Đã báo</Badge>
                      ) : (
                        <Badge variant="pending">Chờ báo</Badge>
                      )}
                    </td>
                  )}
                  {!isMobile && (
                    <td style={{ color: "var(--text-muted)", fontSize: isMobile ? 14 : 15 }}>
                      {sq.reportedAt
                        ? new Date(sq.reportedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
      {openModal && (
  <div
    onClick={() => setOpenModal(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "center",
   alignItems: isMobile ? "flex-start" : "center",
  padding: isMobile ? "20px 12px" : "12px", // 🔥 tạo khoảng trên
    overflowY: "auto", // 🔥 FIX tụt modal

      zIndex: 999,
      animation: "fadeIn .3s ease",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: isMobile ? 420 : 760, // 🔥 mobile nhỏ lại
        maxHeight: isMobile ? "80vh" : "85vh", // 🔥 không full màn
          marginTop: isMobile ? 10 : 0, // 🔥 tránh dính sát top
        height: "auto",
        borderRadius: 14,
        position: "relative",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        animation: "modalZoom .25s ease",
        transform: isMobile ? "translateY(10px)" : "none",
      }}
    >
      {/* BORDER GLOW */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          padding: 1,
          background: "linear-gradient(120deg,#5bc8f5,#00ffae,#ff5252)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          pointerEvents: "none",
          opacity: 0.6,
          animation: "borderMove 4s linear infinite",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          padding: isMobile ? "14px 16px" : "18px 22px",
          display: "flex",
          justifyContent: "space-between",
         alignItems: isMobile ? "flex-start" : "center",
overflowY: "auto", // 🔥 cực quan trọng
          flexWrap: "wrap",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 18 : 20,
              fontWeight: 800,
              color: "#ff8080",
              textShadow: "0 0 12px rgba(255,80,80,.6)",
            }}
          >
            🚨 Danh sách vắng
          </div>

          <div
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            Tổng: <strong>{absentList.length}</strong> quân nhân
          </div>
        </div>

        <button
          onClick={() => setOpenModal(false)}
          style={{
            background: "rgba(255,80,80,.15)",
            border: "1px solid rgba(255,80,80,.4)",
            color: "#ff8080",
            fontSize: 14,
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: isMobile ? 12 : 18,
          overflowY: "auto",
          flex: 1,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {absentList.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 0",
              opacity: 0.7,
            }}
          >
            <div style={{ fontSize: 42 }}>✅</div>
            Không có ai vắng
          </div>
        )}

        {absentList.map((p, i) => {
          const color =
            p.reason === "Bệnh"
              ? "#ff6b6b"
              : p.reason === "Phép"
              ? "#4ade80"
              : "#facc15";

          return (
            <div
              key={i}
              style={{
                padding: isMobile ? 12 : 16,
                marginBottom: 10,
                borderRadius: 10,
                background: "rgba(255,255,255,.04)",
                border: `1px solid ${color}33`,
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 0 20px ${color}55`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle, ${color}22, transparent 70%)`,
                  opacity: 0.4,
                }}
              />

              <div
                style={{
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 15,
                  position: "relative",
                }}
              >
                {p.name}
                <span style={{ opacity: 0.5, marginLeft: 6 }}>
                  ({p.position})
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  marginTop: 8,
                  fontSize: 13,
                  gap: 6,
                  opacity: 0.85,
                  position: "relative",
                }}
              >
                <div>📍 {p.squad}</div>

                <div
                  style={{
                    color: color,
                    fontWeight: 600,
                  }}
                >
                  📌 {p.reason}
                </div>
              </div>

              {p.note && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    opacity: 0.7,
                    fontStyle: "italic",
                  }}
                >
                  📝 {p.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => setOpenModal(false)}
          style={{
            width: isMobile ? "100%" : "auto",
            padding: "12px 18px",
            background: "linear-gradient(135deg,#ff5252,#ff1744)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          🔴 Đóng
        </button>
      </div>
    </div>

    <style>{`
      @keyframes modalZoom {
        from { transform: scale(.9); opacity: 0 }
        to { transform: scale(1); opacity: 1 }
      }

      @keyframes fadeIn {
        from { opacity: 0 }
        to { opacity: 1 }
      }

      @keyframes borderMove {
        0% { filter: hue-rotate(0deg) }
        100% { filter: hue-rotate(360deg) }
      }
    `}</style>
  </div>
)}
    </div>
  );
}

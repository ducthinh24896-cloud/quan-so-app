"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/SessionContext";
import {
  PageHeader,
  Field,
  Input,
  Select,
  Textarea,
  Btn,
  Alert,
  SectionDivider,
} from "@/components/ui";
import type { AbsentPerson, SquadConfig } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ── TYPES ─────────────────────────────────

type Report = {
  btd_total: number;
  btd_present: number;
  btd_absent_list: AbsentPerson[];

  cs_total: number;
  cs_present: number;
  cs_absent_list: AbsentPerson[];

  note?: string;
};

// ── CONSTANT ─────────────────────────────

const POSITIONS = ["Trung đội trưởng", "Tiểu đội trưởng", "Chiến sĩ"];
const REASONS = [
  "Phép",
  "Bệnh",
  "Công tác",
  "Học tập",
  "Nghỉ đặc biệt",
  "Khác",
];

function emptyPerson(): AbsentPerson {
  return { name: "", position: "Chiến sĩ", reason: "Phép", note: "" };
}

// ── COMPONENT ─────────────────────────────

function AbsentRows({
  list,
  onChange,
}: {
  list: AbsentPerson[];
  onChange: (list: AbsentPerson[]) => void;
}) {
  function update(i: number, field: keyof AbsentPerson, val: string) {
    onChange(list.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  }

  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  function addRow() {
    onChange([...list, emptyPerson()]);
  }

  return (
    <div>
      {list.map((person, i) => (
        <div
          key={i}
          style={{
            display: "grid",
           gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            marginBottom: 10,
            
          }}
        >
          <Field label="Họ và tên">
            <Input
              value={person.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
          </Field>

          <Field label="Chức vụ">
            <Select
              value={person.position}
              onChange={(e) => update(i, "position", e.target.value)}
            >
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>

          <Field label="Lý do vắng">
            <Select
              value={person.reason}
              onChange={(e) => update(i, "reason", e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>

          <Field label="Ghi chú">
            <Input
              value={person.note}
              onChange={(e) => update(i, "note", e.target.value)}
            />
          </Field>

          <button onClick={() => remove(i)}>✕</button>
        </div>
      ))}

      <button onClick={addRow}>+ Thêm người vắng</button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────

export default function DiemDanhPage() {
  const { session } = useSession();

  const [squads, setSquads] = useState<SquadConfig[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [btdTotal, setBtdTotal] = useState(5);
  const [btdPresent, setBtdPresent] = useState(5);
  const [btdAbsent, setBtdAbsent] = useState(0);
  const [btdList, setBtdList] = useState<AbsentPerson[]>([]);

  const [csTotal, setCsTotal] = useState(36);
  const [csPresent, setCsPresent] = useState(36);
  const [csAbsent, setCsAbsent] = useState(0);
  const [csList, setCsList] = useState<AbsentPerson[]>([]);

  const [note, setNote] = useState("");

  // auto tính
  useEffect(() => {
    setBtdAbsent(Math.max(0, btdTotal - btdPresent));
  }, [btdTotal, btdPresent]);

  useEffect(() => {
    setCsAbsent(Math.max(0, csTotal - csPresent));
  }, [csTotal, csPresent]);

  // load squads
  const fetchSquads = useCallback(async () => {
    const snap = await getDocs(collection(db, "squads"));

    const data = snap.docs.map((doc) => ({
      id: Number(doc.id),
      ...doc.data(),
    })) as SquadConfig[];

    setSquads(data);
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  // auto chọn trung đội
  useEffect(() => {
    if (session?.role === "trungdoi" && session.squad != null) {
      setSelectedSquad(session.squad);
    }
  }, [session]);

  // load report
  const loadExistingReport = useCallback(
    async (squadId: number) => {
      const sq = squads.find((s) => s.id === squadId);
      if (!sq) return;

      const today = new Date().toISOString().slice(0, 10);

      const q = query(
        collection(db, "reports"),
        where("date", "==", today),
        where("squad_id", "==", squadId),
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data() as Report;

        setBtdTotal(data.btd_total ?? sq.btd_total);
        setBtdPresent(data.btd_present ?? sq.btd_total);
        setBtdList(data.btd_absent_list ?? []);

        setCsTotal(data.cs_total ?? sq.cs_total);
        setCsPresent(data.cs_present ?? sq.cs_total);
        setCsList(data.cs_absent_list ?? []);

        setNote(data.note ?? "");
      } else {
        // reset về config
        setBtdTotal(sq.btd_total);
        setBtdPresent(sq.btd_total);
        setBtdList([]);

        setCsTotal(sq.cs_total);
        setCsPresent(sq.cs_total);
        setCsList([]);

        setNote("");
      }
    },
    [squads],
  );

  useEffect(() => {
    if (squads.length > 0) {
      loadExistingReport(selectedSquad);
    }
  }, [selectedSquad, squads, loadExistingReport]);

  async function handleSubmit() {
    console.log("🔥 CLICKED SUBMIT");

    const sq = squads.find((s) => s.id === selectedSquad);
    if (!sq) {
      console.log("❌ Không tìm thấy squad");
      return;
    }

    setSubmitting(true);
    setAlertMsg(null);

    let success = false; // 👈 FLAG

    try {
      const docRef = await addDoc(collection(db, "reports"), {
        date: new Date().toISOString().slice(0, 10),
        squad_id: selectedSquad,
        squad_name: sq.name,

        btd_total: btdTotal,
        btd_present: btdPresent,
        btd_absent: btdAbsent,
        btd_absent_list: btdList,

        cs_total: csTotal,
        cs_present: csPresent,
        cs_absent: csAbsent,
        cs_absent_list: csList,

        note,
        created_at: serverTimestamp(),
      });

      success = true; // 👈 ĐÁNH DẤU THÀNH CÔNG

      console.log("✅ Đã ghi Firebase:", docRef.id);

      setAlertMsg({ type: "success", text: `✔ Đã lưu báo cáo ${sq.name}` });
    } catch (err) {
      console.error("❌ Lỗi Firebase:", err);

      setAlertMsg({ type: "error", text: "Lỗi lưu dữ liệu" });
    } finally {
      console.log(success ? "🎉 SUBMIT THÀNH CÔNG" : "💥 SUBMIT THẤT BẠI");

      setSubmitting(false);
    }
  }

  const isAdmin = session?.role !== "trungdoi";
  const currentSq = squads.find((s) => s.id === selectedSquad);

  const cardStyle: React.CSSProperties = {
    background:
      "linear-gradient(145deg, rgba(12,36,64,.95), rgba(7,25,41,.95))",
    border: "1px solid rgba(91,200,245,.2)",
   padding: "clamp(16px, 3vw, 30px)",
    marginBottom: 22,
    borderRadius: 6,
    boxShadow: "0 10px 40px rgba(0,0,0,.6)",
    position: "relative",
    overflow: "hidden",
  };
  const h3Style: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#5bc8f5",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const glowLine: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: "linear-gradient(180deg, #5bc8f5, transparent)",
  };

 function getInputStyle(value: number, max?: number): React.CSSProperties {
  const isWarning = max !== undefined && value < max
  const isGood = max !== undefined && value === max

  let color = '#5bc8f5' // mặc định xanh dương

  if (isWarning) color = '#ff8080'   // đỏ
  if (isGood)    color = '#5ddf8a'   // xanh lá

    return {
    background: `
      linear-gradient(120deg, transparent 0%, ${color}33 50%, transparent 100%),
      linear-gradient(145deg, ${color}22, ${color}08),
      rgba(0,0,0,.25)
    `,
    backgroundSize: '200% 100%',   // 👈 đặt ở đây
    animation: 'shine 3s linear infinite', // 👈 đặt ở đây

    border: `2px solid ${color}`,
    borderRadius: 6,
    color: '#fff',
    fontWeight: 700,
    textAlign: 'center',

    boxShadow: `0 0 12px ${color}88, inset 0 0 8px ${color}33`,
    transition: 'all .25s ease',
  }
  
}

  return (
    <div>
      <PageHeader
        title="Điểm danh"
        subtitle={`Báo cáo quân số — ${currentSq?.name ?? ""}`}
      />
      {/* ── Tab chọn trung đội (admin/chihuy) ── */}
      {isAdmin && squads.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: 24,
         overflowX: "auto",
whiteSpace: "nowrap",
          }}
        >
          {squads.map((sq) => {
            const isActive = selectedSquad === sq.id;
            return (
              <button
                key={sq.id}
                onClick={() => setSelectedSquad(sq.id)}
                style={{
                  padding: "10px 26px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "3px 3px 0 0",
                  border: `1px solid ${isActive ? "var(--sky)" : "var(--border)"}`,
                  borderBottom: isActive
                    ? "1px solid var(--panel)"
                    : "1px solid var(--border)",
                  background: isActive ? "var(--sky)" : "rgba(26,110,168,.1)",
                  color: isActive ? "var(--text)" : "rgba(234,246,253,.45)",
                  transition: "all .14s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.color = "rgba(234,246,253,.45)";
                }}
              >
                {sq.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Alert ── */}
      {alertMsg && (
        <Alert type={alertMsg.type} style={{ marginBottom: 20 }}>
          {alertMsg.text}
        </Alert>
      )}

      {/* ── Section I: Cán bộ trung đội ── */}
      <div style={cardStyle}>
        <div style={glowLine}></div>
        <h3 style={h3Style}>
          <span>🪖</span>
          I. Cán bộ Trung đội — {currentSq?.name}
        </h3>

        <div
          style={{
            display: "grid",
           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginBottom: 20,

            padding: 18,
            borderRadius: 8,
            background: `
      linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)),
      linear-gradient(145deg, #1e5f8c, #0c2b45)
    `,
            border: "2px solid rgba(91,200,245,.5)",
            boxShadow: "0 0 25px rgba(91,200,245,.3)",
          }}
        >
          <Field label="Tổng số cán bộ trung đội">
            <Input
              type="number"
              min={0}
              value={btdTotal}
              onChange={(e) => setBtdTotal(Math.max(0, +e.target.value))}
              style={getInputStyle(btdTotal)}
             onFocus={(e) => {
  const el = e.currentTarget
  el.style.transform = 'scale(1.05)'
  el.style.boxShadow += ', 0 0 25px rgba(255,255,255,.3)'
}}

onBlur={(e) => {
  const el = e.currentTarget
  el.style.transform = 'scale(1)'
}}
            />
          </Field>
          <Field label="Có mặt">
            <Input
              type="number"
              min={0}
              max={btdTotal}
              value={btdPresent}
              onChange={(e) =>
                setBtdPresent(Math.max(0, Math.min(btdTotal, +e.target.value)))
              }
              style={getInputStyle(btdPresent, btdTotal)}
             onFocus={(e) => {
  const el = e.currentTarget
  el.style.transform = 'scale(1.05)'
  el.style.boxShadow += ', 0 0 25px rgba(255,255,255,.3)'
}}

onBlur={(e) => {
  const el = e.currentTarget
  el.style.transform = 'scale(1)'
}}
            />
          </Field>
          <Field label="Vắng mặt">
            <Input
              type="number"
              value={btdAbsent}
              readOnly
              style={{
                ...getInputStyle(btdAbsent),
                border:
                  btdAbsent > 0 ? "1px solid #ff8080" : "1px solid #5ddf8a",
                boxShadow:
                  btdAbsent > 0
                    ? "0 0 10px rgba(255,128,128,.5)"
                    : "0 0 10px rgba(93,223,138,.5)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5bc8f5";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(91,200,245,.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91,200,245,.25)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Field>
        </div>

        {/* Danh sách vắng bộ trung đội */}
        {btdAbsent > 0 && (
          <>
            <SectionDivider label="Chi tiết vắng — Cán bộ trung đội" />
            <AbsentRows list={btdList} onChange={setBtdList} />
          </>
        )}
      </div>

      {/* ── Section II: Chiến sĩ ── */}
      <div style={cardStyle}>
        <div style={glowLine}></div>
        <h3 style={h3Style}>
          <span>🪖</span>
          II. Chiến sĩ — {currentSq?.name}
        </h3>

        <div
          style={{
            display: "grid",
           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <Field label="Tổng số chiến sĩ">
            <Input
              type="number"
              min={0}
              value={csTotal}
              onChange={(e) => setCsTotal(Math.max(0, +e.target.value))}
              style={getInputStyle(btdTotal)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5bc8f5";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(91,200,245,.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91,200,245,.25)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Field>
          <Field label="Có mặt">
            <Input
              type="number"
              min={0}
              max={csTotal}
              value={csPresent}
              onChange={(e) =>
                setCsPresent(Math.max(0, Math.min(csTotal, +e.target.value)))
              }
              style={getInputStyle(btdPresent, btdTotal)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5bc8f5";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(91,200,245,.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91,200,245,.25)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Field>
          <Field label="Vắng mặt">
            <Input
              type="number"
              value={csAbsent}
              readOnly
              style={{
                ...getInputStyle(btdAbsent),
                border:
                  btdAbsent > 0 ? "1px solid #ff8080" : "1px solid #5ddf8a",
                boxShadow:
                  btdAbsent > 0
                    ? "0 0 10px rgba(255,128,128,.5)"
                    : "0 0 10px rgba(93,223,138,.5)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#5bc8f5";
                e.currentTarget.style.boxShadow =
                  "0 0 10px rgba(91,200,245,.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(91,200,245,.25)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Field>
        </div>

        {/* Danh sách vắng chiến sĩ */}
        {csAbsent > 0 && (
          <>
            <SectionDivider label="Chi tiết vắng — Chiến sĩ" />
            <AbsentRows list={csList} onChange={setCsList} />
          </>
        )}
      </div>

      {/* ── Section III: Ghi chú & xác nhận ── */}
      <div style={cardStyle}>
        <div style={glowLine}></div>
        <h3 style={h3Style}>
          <span>🪖</span>
          III. Ghi chú &amp; Xác nhận
        </h3>

        {/* Tóm tắt */}
      <div
  style={{
    display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  }}
>
  {[
    {
      label: "Tổng quân số",
      value: btdTotal + csTotal,
      icon: "📊",
      color: "#5bc8f5",
    },
    {
      label: "Có mặt",
      value: btdPresent + csPresent,
      icon: "✅",
      color: "#5ddf8a",
    },
    {
      label: "Vắng mặt",
      value: btdAbsent + csAbsent,
      icon: "⚠️",
      color: btdAbsent + csAbsent > 0 ? "#ff8080" : "#5ddf8a",
    },
  ].map((item) => (
    <div
      key={item.label}
      style={{
        position: 'relative',

        // 🔥 nền gradient + ánh sáng chạy
        background: `
          linear-gradient(120deg, transparent 0%, ${item.color}33 50%, transparent 100%),
          linear-gradient(145deg, ${item.color}22, ${item.color}08),
          rgba(0,0,0,.35)
        `,
        backgroundSize: '200% 100%',
        animation: 'shine 4s linear infinite',

        border: `2px solid ${item.color}`,
        padding: "18px",
        borderRadius: 8,

        // 🔥 glow mạnh hơn
        boxShadow: `
          0 0 20px ${item.color}55,
          inset 0 0 10px ${item.color}22
        `,

        transition: "all .25s ease",
        overflow: 'hidden',
      }}

      // 🔥 hover cực đã
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.05)'
        el.style.boxShadow += `, 0 0 35px ${item.color}`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
        el.style.boxShadow = `
          0 0 20px ${item.color}55,
          inset 0 0 10px ${item.color}22
        `
      }}
    >
      {/* 🔥 viền sáng bên trái */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 4,
        height: '100%',
        background: item.color,
        boxShadow: `0 0 10px ${item.color}`,
      }} />

      <div
        style={{
          fontSize: 11,
          color: "#fff",
          letterSpacing: 2,
          marginBottom: 8,
          fontWeight: 700,
          opacity: 0.85,
        }}
      >
        {item.icon} {item.label}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: item.color,
          textShadow: `0 0 10px ${item.color}`,
          fontFamily: 'Orbitron, monospace', // 🔥 rất hợp style này
        }}
      >
        {item.value}
      </div>
    </div>
  ))}
</div>

        <Field label="Ghi chú bổ sung">
  <Textarea
    placeholder="Ghi chú thêm nếu có (tình huống đặc biệt, thông tin khác...)"
    value={note}
    onChange={(e) => setNote(e.target.value)}
    style={{
      // 🔥 nền gradient giống input
      background: `
        linear-gradient(120deg, transparent 0%, #5bc8f533 50%, transparent 100%),
        linear-gradient(145deg, #5bc8f522, #5bc8f508),
        rgba(0,0,0,.35)
      `,
      backgroundSize: '200% 100%',
      animation: 'shine 4s linear infinite',

      border: '2px solid #5bc8f5',
      borderRadius: 8,

      color: '#fff',
      fontSize: 14,
      lineHeight: 1.6,

      padding: '12px 14px',
      minHeight: 120,
      resize: 'vertical',

      // 🔥 glow
      boxShadow: `
        0 0 15px rgba(91,200,245,.4),
        inset 0 0 10px rgba(91,200,245,.2)
      `,

      transition: 'all .25s ease',
    }}

    // 🔥 focus = sáng mạnh
    onFocus={(e) => {
      const el = e.currentTarget
      el.style.borderColor = '#5bc8f5'
      el.style.boxShadow = `
        0 0 25px rgba(91,200,245,.9),
        inset 0 0 12px rgba(91,200,245,.5)
      `
      el.style.transform = 'scale(1.01)'
    }}

    onBlur={(e) => {
      const el = e.currentTarget
      el.style.borderColor = '#5bc8f5'
      el.style.boxShadow = `
        0 0 15px rgba(91,200,245,.4),
        inset 0 0 10px rgba(91,200,245,.2)
      `
      el.style.transform = 'scale(1)'
    }}
  />
</Field>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
  <Btn
    onClick={handleSubmit}
    loading={submitting}
    style={{
      position: 'relative',

      // 🔥 nền gradient đỏ → cam (rất hút mắt)
      background: `
        linear-gradient(120deg, #ff4d4d, #ff8c42, #ff4d4d)
      `,
      backgroundSize: '200% 100%',
      animation: 'shine 3s linear infinite',

      border: '2px solid #ff8080',
      color: '#fff',

      padding: '14px 36px',
      fontSize: 15,
      fontWeight: 900,
      letterSpacing: 2,
      textTransform: 'uppercase',
width: "100%",
maxWidth: 420,
      borderRadius: 8,
      cursor: 'pointer',

      // 🔥 glow cực mạnh
      boxShadow: `
        0 0 20px rgba(255,80,80,.7),
        0 0 40px rgba(255,120,60,.5),
        inset 0 0 10px rgba(255,255,255,.2)
      `,

      transition: 'all .25s ease',
    }}

    // 🔥 hover = phóng + cháy hơn
    onMouseEnter={(e) => {
      const el = e.currentTarget
      el.style.transform = 'scale(1.08)'
      el.style.boxShadow = `
        0 0 30px rgba(255,80,80,1),
        0 0 60px rgba(255,120,60,.9)
      `
    }}

    onMouseLeave={(e) => {
      const el = e.currentTarget
      el.style.transform = 'scale(1)'
      el.style.boxShadow = `
        0 0 20px rgba(255,80,80,.7),
        0 0 40px rgba(255,120,60,.5),
        inset 0 0 10px rgba(255,255,255,.2)
      `
    }}
  >
    🚀 Gửi báo cáo điểm danh
  </Btn>
</div>
      </div>
      <style>{`
@media (max-width: 768px) {
  h3 {
    font-size: 12px !important;
    letter-spacing: 1.5px !important;
  }

  input, textarea, select {
    font-size: 14px !important;
  }

  button {
    font-size: 13px !important;
  }
}

@media (max-width: 480px) {
  h3 {
    font-size: 11px !important;
  }
}
  @media (max-width: 600px) {
  grid-template-columns: 1fr;
}
`}</style>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../src/config/api";

// Styles
const S = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "40px", fontFamily: "Inter, sans-serif" },
  pageTitle: { fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" },
  pageSub: { fontSize: "1.05rem", color: "#64748b", marginBottom: "32px" },
  topRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" },
  statCard: {
    background: "#fff", borderRadius: "16px", padding: "24px",
    display: "flex", alignItems: "center", gap: "18px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)", transition: "transform 0.2s",
  },
  statIconWrap: { width: "56px", height: "56px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" },
  statNum: { fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 },
  statLabel: { fontSize: "0.9rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  quickBtn: (color) => ({
    background: "#fff", border: `2px solid ${color}20`, borderRadius: "14px", padding: "16px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
    cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }),
  quickIcon: { fontSize: "2rem" },
  quickLabel: (color) => ({ fontSize: "0.95rem", fontWeight: 700, color }),
  card: { background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" },
  cardTitle: { fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "10px" },
  tableWrap: { borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
  tableHead: { background: "#1e293b", color: "#fff" },
  th: { padding: "16px 20px", textAlign: "left", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" },
  td: { padding: "18px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "0.95rem", color: "#334155" },
  badge: (isOccupied) => ({
    display: "inline-block", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
    background: isOccupied ? "#fee2e2" : "#dcfce7", color: isOccupied ? "#b91c1c" : "#15803d",
  }),
  spinner: { display: "flex", justifyContent: "center", padding: "40px" },
  spinnerEl: { width: "30px", height: "30px", border: "3px solid #e2e8f0", borderTopColor: "#ea580c", borderRadius: "50%", animation: "spin 1s linear infinite" },
};

const QUICK_ACTIONS = [
  { label: "Tables", icon: "🪑", path: "/table-management", color: "#2563eb" },
  { label: "Foods", icon: "🍽️", path: "/add-food", color: "#d97706" },
  { label: "Coupons", icon: "🎟️", path: "/coupon-management", color: "#7c3aed" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await api.get("/tables");
        setTables(tRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial load
    load();
    
    // Poll every 3 seconds for live updates
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalBooked = tables.filter((t) => t.booked).length;
  const totalAvailable = tables.length - totalBooked;

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Admin Dashboard 🎛️</h1>
      <p style={S.pageSub}>Overview of your hotel system — tables and operations.</p>

      {/* ── STAT CARDS ── */}
      <div style={S.topRow}>
        {[
          { icon: "🪑", label: "Total Tables", value: tables.length, color: "#eff6ff", iconColor: "#2563eb" },
          { icon: "📌", label: "Booked", value: totalBooked, color: "#fef2f2", iconColor: "#dc2626" },
          { icon: "✅", label: "Available", value: totalAvailable, color: "#f0fdf4", iconColor: "#16a34a" },
        ].map((stat) => (
          <div style={S.statCard} key={stat.label}>
            <div style={{ ...S.statIconWrap, background: stat.color }}>
              <span style={{ color: stat.iconColor }}>{stat.icon}</span>
            </div>
            <div>
              <div style={S.statNum}>{loading ? "—" : stat.value}</div>
              <div style={S.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "14px" }}>⚡ Quick Actions</h2>
        <div style={S.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              style={{
                ...S.quickBtn(a.color),
                borderColor: hoveredAction === a.label ? a.color : `${a.color}20`,
                transform: hoveredAction === a.label ? "translateY(-4px)" : "none",
                boxShadow: hoveredAction === a.label ? `0 8px 24px ${a.color}30` : "0 2px 12px rgba(0,0,0,.06)",
              }}
              onMouseEnter={() => setHoveredAction(a.label)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={() => navigate(a.path)}
            >
              <span style={S.quickIcon}>{a.icon}</span>
              <span style={S.quickLabel(a.color)}>Manage {a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE OCCUPANCY (FULL WIDTH) ── */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>📊 Table Occupancy</h3>
        <div style={S.tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={S.tableHead}>
              <tr>
                {["#", "Table Name", "Type", "Status"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", padding: "32px" }}>
                  <div style={S.spinnerEl} />
                </td></tr>
              ) : tables.length === 0 ? (
                <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#94a3b8" }}>No tables found</td></tr>
              ) : tables.map((t, idx) => (
                <tr key={t.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={S.td}>{idx + 1}</td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{t.table_name}</td>
                  <td style={S.td}>{t.table_type}</td>
                  <td style={S.td}>
                    <span style={S.badge(t.booked)}>
                      {t.booked ? "🔴 Occupied" : "🟢 Available"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

const TABS = [
  { id: "home", icon: "🏠", label: "home" },
  { id: "cerca", icon: "🔍", label: "cerca" },
  { id: "libreria", icon: "📚", label: "libreria" },
  { id: "statistiche", icon: "📊", label: "statistiche" },
  { id: "ai", icon: "✨", label: "AI" },
];

export default function NavBar({ current, nav }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", background: "#fff", borderTop: "0.5px solid #D9C9B8", padding: "8px 0 4px" }}>
      {TABS.map(t => (
        <div key={t.id} onClick={() => nav(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: "4px 0", fontSize: 10, color: current === t.id ? "#2C3E50" : "#8B7355" }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          {t.label}
        </div>
      ))}
    </div>
  );
}

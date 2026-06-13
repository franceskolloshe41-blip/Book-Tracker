import { useState, useEffect } from "react";
import NavBar from "./NavBar";

const MOODS = [
  { id:"avventura", icon:"🏔", label:"avventura" },
  { id:"riflessivo", icon:"🌙", label:"riflessivo" },
  { id:"intenso", icon:"⚡", label:"intenso" },
  { id:"leggero", icon:"☀️", label:"leggero" },
  { id:"curioso", icon:"🔭", label:"curioso" },
];

const RECS = {
  avventura: [
    { title:"Il conte di Montecristo", author:"Alexandre Dumas", reason:"Un classico dell avventura — impossibile smettere" },
    { title:"L isola del tesoro", author:"Robert Louis Stevenson", reason:"Pirati, mappe e misteri — un avventura senza tempo" },
    { title:"Il vecchio e il mare", author:"Ernest Hemingway", reason:"Un uomo solo contro la natura — essenziale e potente" },
  ],
  riflessivo: [
    { title:"La strada", author:"Cormac McCarthy", reason:"Amore paterno in un mondo alla fine — devastante" },
    { title:"Siddharta", author:"Hermann Hesse", reason:"Un viaggio interiore — perfetto per momenti riflessivi" },
    { title:"Le correzioni", author:"Jonathan Franzen", reason:"Riflessioni sul tempo e sui legami familiari" },
  ],
  intenso: [
    { title:"Delitto e castigo", author:"Fedor Dostoevskij", reason:"Analisi psicologica brutale — ti entra dentro" },
    { title:"Il processo", author:"Franz Kafka", reason:"Kafkiano nel senso più puro — angosciante e geniale" },
    { title:"American Psycho", author:"Bret Easton Ellis", reason:"Critica spietata al capitalismo — disturbante e geniale" },
  ],
  leggero: [
    { title:"Il piccolo principe", author:"Antoine de Saint-Exupery", reason:"Breve, poetico e pieno di saggezza" },
    { title:"Norwegian Wood", author:"Haruki Murakami", reason:"Nostalgia e musica — delicato e perfetto" },
    { title:"Siddharta", author:"Hermann Hesse", reason:"Si legge in una sera con il cuore leggero" },
  ],
  curioso: [
    { title:"Breve storia del tempo", author:"Stephen Hawking", reason:"L universo spiegato a tutti — meraviglioso" },
    { title:"Il gene egoista", author:"Richard Dawkins", reason:"Cambierà il modo in cui vedi il mondo" },
    { title:"Sapiens", author:"Yuval Noah Harari", reason:"La storia dell umanità in un libro — imperdibile" },
  ],
};

const AI_TEXTS = {
  avventura: "Ami le narrazioni dense. Ti consiglio qualcosa che mantenga quella profondità — non semplice intrattenimento, ma avventura che lascia il segno.",
  riflessivo: "Con Eco, Debord e Calvino hai dimostrato che ti piace fermarti a pensare. Questi libri ti porteranno ancora più in profondità.",
  intenso: "La tua libreria mostra un lettore che non ha paura della complessità. Questi libri ti sfideranno.",
  leggero: "Hai letto molto di denso. Una pausa leggera fa bene — questi libri ti lasceranno una sensazione calda.",
  curioso: "La filosofia di Debord e Eco mostra una mente sempre alla ricerca. Questi libri soddisferanno quella curiosità.",
};

function BookCover({ title, author }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;
    setLoading(true);
    fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(title + " " + author) + "&limit=1&fields=cover_i")
      .then(r => r.json())
      .then(data => { const id = data.docs?.[0]?.cover_i; if (id) setSrc("https://covers.openlibrary.org/b/id/"+id+"-M.jpg"); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [title, author]);

  const style = { width:48, height:66, borderRadius:6, flexShrink:0, overflow:"hidden", background:"#EDE3D6", display:"flex", alignItems:"center", justifyContent:"center" };
  if (loading) return <div style={{ ...style, background:"linear-gradient(90deg,#E8E0D8 25%,#F2EAE0 50%,#E8E0D8 75%)", backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />;
  return <div style={style}>{src ? <img src={src} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={() => setSrc(null)} /> : <span style={{ fontSize:22 }}>📖</span>}</div>;
}

export default function ConsiglAI({ books, addBook, currentScreen, nav }) {
  const [mood, setMood] = useState("avventura");
  const [based, setBased] = useState("la mia libreria");
  const [added, setAdded] = useState(new Set());
  const [freeQ, setFreeQ] = useState("");
  const [freeA, setFreeA] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = (r) => {
    addBook({ id: Date.now(), title: r.title, author: r.author, cover: null, pages: 300, genre: "Fiction" });
    setAdded(prev => new Set([...prev, r.title]));
  };

  const askFree = () => {
    if (!freeQ.trim()) return;
    setLoading(true);
    setFreeA("");
    setTimeout(() => {
      setFreeA("Basandomi sulla tua libreria e su " + freeQ + ", ti consiglio La metamorfosi di Kafka — breve, denso e impossibile da dimenticare. Oppure Siddharta di Hesse se cerchi qualcosa di più contemplativo.");
      setLoading(false);
      setFreeQ("");
    }, 1200);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F3EE" }}>
      <div style={{ padding:"20px 16px 16px", background:"#F7F3EE", borderBottom:"0.5px solid #D9C9B8", flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:500, color:"#2C1F14", textAlign:"center" }}>Consigli AI</div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        <div style={{ fontSize:13, fontWeight:500, color:"#2C1F14", marginBottom:10 }}>Come ti senti oggi?</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:16, scrollbarWidth:"none" }}>
          {MOODS.map(m => (
            <div key={m.id} onClick={() => setMood(m.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 14px", borderRadius:12, border:"0.5px solid", borderColor:mood===m.id?"#2C3E50":"#D9C9B8", background:mood===m.id?"#2C3E50":"#fff", cursor:"pointer", flexShrink:0 }}>
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <span style={{ fontSize:11, color:mood===m.id?"white":"#8B7355", whiteSpace:"nowrap" }}>{m.label}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize:13, fontWeight:500, color:"#2C1F14", marginBottom:10 }}>Basato su</div>
        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {["la mia libreria","un libro specifico"].map(b => (
            <div key={b} onClick={() => setBased(b)} style={{ fontSize:12, padding:"6px 14px", borderRadius:100, border:"0.5px solid", borderColor:based===b?"#2C3E50":"#D9C9B8", background:based===b?"#2C3E50":"#fff", color:based===b?"white":"#8B7355", cursor:"pointer" }}>{b}</div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:13, color:"#2C1F14", lineHeight:1.6 }}>
          <div style={{ fontSize:10, color:"#8B7355", marginBottom:6 }}>✨ analisi della tua libreria</div>
          {AI_TEXTS[mood]}
        </div>

        <div style={{ fontSize:13, fontWeight:500, color:"#2C1F14", marginBottom:10 }}>I tuoi prossimi libri</div>
        {RECS[mood].map(r => (
          <div key={r.title} style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12 }}>
            <BookCover title={r.title} author={r.author} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#2C1F14", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.title}</div>
              <div style={{ fontSize:12, color:"#8B7355", marginTop:1, marginBottom:6 }}>{r.author}</div>
              <div style={{ fontSize:12, color:"#4A6741", background:"#EAF3DE", borderRadius:8, padding:"4px 8px", marginBottom:8, lineHeight:1.4 }}>{r.reason}</div>
              <button onClick={() => handleAdd(r)} style={{ fontSize:11, padding:"4px 8px", borderRadius:8, border:"0.5px solid", borderColor:added.has(r.title)?"#3D5A80":"#D9C9B8", background:added.has(r.title)?"#3D5A80":"none", color:added.has(r.title)?"white":"#8B7355", cursor:"pointer", fontFamily:"inherit" }}>
                {added.has(r.title) ? "✓ aggiunto" : "+ aggiungi"}
              </button>
            </div>
          </div>
        ))}

        <div style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginTop:8, marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#8B7355", marginBottom:8 }}>Hai una domanda specifica?</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={freeQ} onChange={e => setFreeQ(e.target.value)} onKeyDown={e => e.key==="Enter" && askFree()} placeholder="es. un libro breve ma intenso..." style={{ flex:1, fontSize:13, padding:"8px 12px", borderRadius:8, border:"0.5px solid #D9C9B8", background:"#F7F3EE", color:"#2C1F14", outline:"none", fontFamily:"inherit" }} />
            <button onClick={askFree} style={{ background:"#2C3E50", color:"white", border:"none", borderRadius:8, padding:"8px 12px", fontSize:13, cursor:"pointer" }}>→</button>
          </div>
          {loading && <div style={{ padding:"8px 0", color:"#8B7355", fontSize:13 }}>...</div>}
          {freeA && <div style={{ marginTop:10, fontSize:13, color:"#2C1F14", lineHeight:1.6, padding:10, background:"#F7F3EE", borderRadius:8 }}>{freeA}</div>}
        </div>
      </div>
      <NavBar current={currentScreen} nav={nav} />
    </div>
  );
}
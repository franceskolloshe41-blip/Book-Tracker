import { useRef, useState, useEffect } from "react";
import NavBar from "./NavBar";

const PRESETS = [
  {name:"notte",color:"#2C3E50"},
  {name:"bosco",color:"#2D4A3E"},
  {name:"autunno",color:"#6B3A2A"},
  {name:"nebbia",color:"#4A5568"},
  {name:"inchiostro",color:"#1A1A2E"},
  {name:"pino",color:"#2D4739"}
];

function formatDate() {
  const d = new Date();
  const days = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
  const months = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

function pct(b) { return b.pages ? Math.round((b.pagesRead / b.pages) * 100) : 0; }

function motivationalText(done, goal) {
  if (done === 0) return "inizia la tua prima lettura!";
  if (done >= goal) return "obiettivo raggiunto!";
  const left = goal - done;
  const p = Math.round((done / goal) * 100);
  if (p < 25) return "ottimo inizio — mancano " + left + " libri";
  if (p < 50) return "stai andando bene — mancano " + left + " libri";
  if (p < 75) return "più della metà fatta — ancora " + left + " libri!";
  return "quasi arrivato — solo " + left + " libri ancora!";
}

function BookCover({ title, author, cover }) {
  const [src, setSrc] = useState(cover || null);
  const [loading, setLoading] = useState(!cover);

  useEffect(() => {
    if (cover) { setSrc(cover); setLoading(false); return; }
    if (!title) return;
    setLoading(true);
    const q = encodeURIComponent(title + " " + author);
    fetch("https://openlibrary.org/search.json?q=" + q + "&limit=1&fields=cover_i")
      .then(r => r.json())
      .then(data => {
        const coverId = data.docs?.[0]?.cover_i;
        if (coverId) setSrc("https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [title, author, cover]);

  const style = {
    width: 44, height: 62, borderRadius: 6, flexShrink: 0,
    overflow: "hidden", background: "#EDE3D6",
    display: "flex", alignItems: "center", justifyContent: "center"
  };

  if (loading) return (
    <div style={{ ...style, background: "linear-gradient(90deg,#E8E0D8 25%,#F2EAE0 50%,#E8E0D8 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
  );

  return (
    <div style={style}>
      {src
        ? <img src={src} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={() => setSrc(null)} />
        : <span style={{ fontSize: 24 }}>📖</span>
      }
    </div>
  );
}

function BookCard({ b }) {
  const p = pct(b);
  return (
    <div style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12, alignItems:"flex-start" }}>
      <BookCover title={b.title} author={b.author} cover={b.cover} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, color:"#2C1F14", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.title}</div>
        <div style={{ fontSize:12, color:"#8B7355", marginTop:1, marginBottom:8 }}>{b.author}</div>
        {b.pages && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:11, color:"#8B7355" }}>{b.pagesRead} / {b.pages} pag.</span>
              <span style={{ fontSize:11, fontWeight:500, color:"#2C1F14" }}>{p}%</span>
            </div>
            <div style={{ height:3, background:"#EDE3D6", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:p+"%", height:"100%", background:"#2C3E50", borderRadius:3 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home({ books, nav, currentScreen, bgColor, setBgColor, bgImage, setBgImage, avatar, setAvatar }) {
  const avatarRef = useRef();
  const bgRef = useRef();
  const done = books.filter(b => b.status === "done").length;
  const reading = books.filter(b => b.status === "reading").length;
  const pages = books.reduce((s, b) => s + (b.pagesRead || 0), 0);
  const goal = 24;
  const goalPct = Math.min(Math.round((done / goal) * 100), 100);
  const readingBooks = books.filter(b => b.status === "reading");
  const recent = [...books].sort((a, b) => new Date(b.added) - new Date(a.added)).slice(0, 3);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F3EE" }}>
      {/* TOP BAR */}
      <div style={{
        padding:"28px 20px 22px",
        background: bgImage ? "transparent" : bgColor,
        backgroundImage: bgImage ? "url("+bgImage+")" : "none",
        backgroundSize:"cover", backgroundPosition:"center",
        display:"flex", flexDirection:"column", alignItems:"center", gap:12,
        position:"relative", minHeight:160, overflow:"hidden"
      }}>
        {bgImage && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.38)" }} />}
        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:12, width:"100%" }}>
          <div style={{ position:"relative", width:76, height:76, cursor:"pointer" }} onClick={() => avatarRef.current.click()}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:"rgba(44,62,80,0.8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:500, color:"#AED6F1", overflow:"hidden", border:"2px solid rgba(255,255,255,0.4)" }}>
              {avatar ? <img src={avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "F"}
            </div>
            <div style={{ position:"absolute", bottom:0, right:0, width:22, height:22, borderRadius:"50%", background:"rgba(0,0,0,0.5)", border:"1.5px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"white" }}>📷</div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setAvatar(ev.target.result); r.readAsDataURL(f); }} />
          <div style={{ fontSize:13, color:"#C8D6DF", textAlign:"center" }}>{formatDate()}</div>
          <div style={{ display:"flex", gap:6 }}>
            {PRESETS.map((p,i) => (
              <div key={i} onClick={() => { setBgColor(p.color); setBgImage(null); }}
                style={{ width:28, height:28, borderRadius:"50%", background:p.color, cursor:"pointer", border: bgColor===p.color&&!bgImage?"2px solid white":"2px solid transparent" }}
                title={p.name} />
            ))}
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"rgba(255,255,255,0.75)", cursor:"pointer", background:"rgba(0,0,0,0.25)", border:"0.5px solid rgba(255,255,255,0.2)", borderRadius:100, padding:"4px 10px" }}>
            📷 cambia sfondo
            <input ref={bgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setBgImage(ev.target.result); r.readAsDataURL(f); }} />
          </label>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"14px 16px", background:"#F7F3EE", borderBottom:"0.5px solid #D9C9B8" }}>
        {[
          { bg:"#3D5A80", val:done, lbl:"libri letti", valC:"#E0FBFC", lblC:"rgba(224,251,252,0.65)" },
          { bg:"#F7F3EE", val:reading, lbl:"in lettura", valC:"#2C3E50", lblC:"#8B7355", border:"0.5px solid #D9C9B8" },
          { bg:"#8B3A2A", val:pages>=1000?(pages/1000).toFixed(1)+"k":pages, lbl:"pagine lette", valC:"#FFE8D6", lblC:"rgba(255,232,214,0.65)" }
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:8, padding:12, textAlign:"center", border:s.border }}>
            <div style={{ fontSize:24, fontWeight:500, color:s.valC }}>{s.val}</div>
            <div style={{ fontSize:10, color:s.lblC, marginTop:4 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* SCROLL */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:500, color:"#2C1F14" }}>in lettura</span>
          <span style={{ fontSize:12, color:"#2C3E50", cursor:"pointer" }} onClick={() => nav("libreria")}>vedi tutti →</span>
        </div>
        {readingBooks.length
          ? readingBooks.map(b => <BookCard key={b.id} b={b} />)
          : <div style={{ fontSize:13, color:"#8B7355", textAlign:"center", padding:"1rem 0" }}>nessun libro in lettura</div>
        }

        <div style={{ height:"0.5px", background:"#D9C9B8", margin:"12px 0" }} />

        <div style={{ marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:500, color:"#2C1F14" }}>obiettivo annuale</span>
        </div>
        <div style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:14, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:500, color:"#2C1F14" }}>libri nel 2026</span>
            <span style={{ fontSize:13, color:"#8B7355" }}>{done} / {goal}</span>
          </div>
          <div style={{ height:5, background:"#EDE3D6", borderRadius:5, overflow:"hidden", marginBottom:6 }}>
            <div style={{ width:goalPct+"%", height:"100%", background:"#3D5A80", borderRadius:5 }} />
          </div>
          <div style={{ fontSize:11, color:"#8B7355" }}>{motivationalText(done, goal)}</div>
        </div>

        <div style={{ height:"0.5px", background:"#D9C9B8", margin:"0 0 12px" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:500, color:"#2C1F14" }}>ultimi aggiunti</span>
          <span style={{ fontSize:12, color:"#2C3E50", cursor:"pointer" }} onClick={() => nav("cerca")}>cerca libri →</span>
        </div>
        {recent.map(b => <BookCard key={b.id} b={b} />)}
        <div style={{ height:16 }} />
      </div>

      <NavBar current={currentScreen} nav={nav} />
    </div>
  );
}
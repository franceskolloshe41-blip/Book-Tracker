import { useState, useEffect } from "react";
import NavBar from "./NavBar";

const STATUS_LABEL = { reading:"In lettura", done:"Letto", paused:"In pausa", "to-read":"Da leggere" };
const TABS = ["reading","done","to-read","paused"];

function BookCover({ title, author, cover }) {
  const [src, setSrc] = useState(cover || null);
  const [loading, setLoading] = useState(!cover);

  useEffect(() => {
    if (cover) { setSrc(cover); setLoading(false); return; }
    if (!title) return;
    setLoading(true);
    fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(title + " " + author) + "&limit=1&fields=cover_i")
      .then(r => r.json())
      .then(data => { const id = data.docs?.[0]?.cover_i; if (id) setSrc("https://covers.openlibrary.org/b/id/"+id+"-M.jpg"); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [title, author, cover]);

  const style = { width:48, height:66, borderRadius:6, flexShrink:0, overflow:"hidden", background:"#EDE3D6", display:"flex", alignItems:"center", justifyContent:"center" };
  if (loading) return <div style={{ ...style, background:"linear-gradient(90deg,#E8E0D8 25%,#F2EAE0 50%,#E8E0D8 75%)", backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />;
  return <div style={style}>{src ? <img src={src} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={() => setSrc(null)} /> : <span style={{ fontSize:22 }}>📖</span>}</div>;
}

export default function Libreria({ books, updateBook, removeBook, currentScreen, nav }) {
  const [tab, setTab] = useState("reading");
  const [sort, setSort] = useState("recent");

  const sorted = [...books.filter(b => b.status === tab)].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "author") return a.author.localeCompare(b.author);
    if (sort === "pages") return b.pages - a.pages;
    return new Date(b.added) - new Date(a.added);
  });

  const pct = b => b.pages ? Math.round((b.pagesRead / b.pages) * 100) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F3EE" }}>
      <div style={{ padding:"20px 16px 14px", background:"#F7F3EE", borderBottom:"0.5px solid #D9C9B8", flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:500, color:"#2C1F14", textAlign:"center", marginBottom:14 }}>Libreria</div>
        <div style={{ display:"flex", background:"#EDE3D6", borderRadius:8, padding:3 }}>
          {TABS.map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ flex:1, textAlign:"center", fontSize:11, padding:"6px 2px", borderRadius:6, cursor:"pointer", background:tab===t?"#fff":"none", color:tab===t?"#2C1F14":"#8B7355", fontWeight:tab===t?500:400, whiteSpace:"nowrap" }}>
              {STATUS_LABEL[t]}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize:12, color:"#8B7355", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            <option value="recent">Recenti</option>
            <option value="title">Titolo A-Z</option>
            <option value="author">Autore</option>
            <option value="pages">Pagine</option>
          </select>
        </div>
        <div style={{ fontSize:12, color:"#8B7355", marginBottom:10 }}>{sorted.length} libri</div>

        {sorted.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
            <div style={{ fontSize:32, color:"#D9C9B8", marginBottom:10 }}>📚</div>
            <div style={{ fontSize:14, fontWeight:500, color:"#2C1F14", marginBottom:4 }}>Nessun libro qui</div>
            <div style={{ fontSize:12, color:"#8B7355" }}>vai in Cerca per aggiungere libri</div>
          </div>
        ) : sorted.map(b => (
          <div key={b.id} style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12 }}>
            <BookCover title={b.title} author={b.author} cover={b.cover} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#2C1F14", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.title}</div>
              <div style={{ fontSize:12, color:"#8B7355", marginTop:1, marginBottom:6 }}>{b.author}</div>
              <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                {b.genre && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:100, border:"0.5px solid #D9C9B8", color:"#8B7355" }}>{b.genre}</span>}
                {b.pages && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:100, border:"0.5px solid #D9C9B8", color:"#8B7355" }}>{b.pages} pag.</span>}
              </div>
              {b.status === "reading" && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:10, color:"#8B7355" }}>{b.pagesRead} / {b.pages}</span>
                    <span style={{ fontSize:10, fontWeight:500, color:"#2C1F14" }}>{pct(b)}%</span>
                  </div>
                  <div style={{ height:3, background:"#EDE3D6", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:pct(b)+"%", height:"100%", background:"#2C3E50", borderRadius:3 }} />
                  </div>
                </div>
              )}
              <div style={{ display:"flex", gap:6 }}>
                {b.status !== "done" && <button onClick={() => updateBook(b.id,{status:"done",pagesRead:b.pages})} style={{ fontSize:11, padding:"4px 8px", borderRadius:8, border:"0.5px solid #D9C9B8", color:"#8B7355", background:"none", cursor:"pointer", fontFamily:"inherit" }}>✓ letto</button>}
                {b.status !== "reading" && b.status !== "done" && <button onClick={() => updateBook(b.id,{status:"reading"})} style={{ fontSize:11, padding:"4px 8px", borderRadius:8, border:"0.5px solid #D9C9B8", color:"#8B7355", background:"none", cursor:"pointer", fontFamily:"inherit" }}>▶ inizia</button>}
                <button onClick={() => removeBook(b.id)} style={{ fontSize:11, padding:"4px 8px", borderRadius:8, border:"0.5px solid #D9C9B8", color:"#8B7355", background:"none", cursor:"pointer", fontFamily:"inherit" }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <NavBar current={currentScreen} nav={nav} />
    </div>
  );
}
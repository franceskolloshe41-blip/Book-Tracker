import { useState } from "react";
import NavBar from "./NavBar";

const FILTERS = ["Tutti","Fiction","Saggistica","Storia","Filosofia","Scienze","Classici"];
const GENRE_MAP = {
  "Tutti": "",
  "Fiction": "+subject:fiction",
  "Saggistica": "+subject:nonfiction",
  "Storia": "+subject:history",
  "Filosofia": "+subject:philosophy",
  "Scienze": "+subject:science",
  "Classici": "+subject:classics",
};

function EditionModal({ book, onClose, onAdd, added }) {
  const editions = book.editions || [book];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:"#F7F3EE", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:430, maxHeight:"70vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 16px 12px", borderBottom:"0.5px solid #D9C9B8", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:500, color:"#2C1F14" }}>{book.title}</div>
            <div style={{ fontSize:12, color:"#8B7355", marginTop:2 }}>{book.author}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#8B7355" }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:16 }}>
          <div style={{ fontSize:12, color:"#8B7355", marginBottom:12 }}>Scegli l'edizione</div>
          {editions.map((ed, i) => {
            const edId = ed.id + "_" + i;
            const isAdded = added.has(edId);
            return (
              <div key={i} style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#2C1F14" }}>{ed.publisher || "Editore sconosciuto"}</div>
                  <div style={{ fontSize:12, color:"#8B7355", marginTop:2 }}>
                    {[ed.year, ed.pages ? ed.pages+" pag." : null].filter(Boolean).join(" · ")}
                  </div>
                  {ed.isbn && <div style={{ fontSize:11, color:"#B8A898", marginTop:2 }}>ISBN: {ed.isbn}</div>}
                </div>
                <button onClick={() => onAdd(ed, edId)} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, border:"0.5px solid", borderColor:isAdded?"#3D5A80":"#2C3E50", background:isAdded?"#3D5A80":"none", color:isAdded?"white":"#2C3E50", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  {isAdded ? "✓" : "+ aggiungi"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function parseBook(item) {
  const info = item.volumeInfo || {};
  const cover = info.imageLinks?.thumbnail?.replace("http://","https://") || null;
  return {
    id: item.id,
    title: info.title || "Titolo sconosciuto",
    author: (info.authors || []).join(", ") || "Autore sconosciuto",
    cover,
    pages: info.pageCount || null,
    genre: (info.categories || [])[0] || null,
    year: info.publishedDate ? info.publishedDate.substring(0,4) : null,
    publisher: info.publisher || null,
    isbn: (info.industryIdentifiers || []).find(x => x.type === "ISBN_13")?.identifier || null,
  };
}

export default function Cerca({ addBook, currentScreen, nav }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [added, setAdded] = useState(new Set());
  const [selectedBook, setSelectedBook] = useState(null);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const genreQ = GENRE_MAP[filter] || "";
      // Nessun langRestrict — cerca in tutte le lingue per massima copertura
      const url = "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(query) + genreQ + "&maxResults=15&orderBy=relevance&key=AIzaSyABIvI6EuEgF5owbVojMlleQXetPIEZNPs"; 


      const res = await fetch(url);
      const data = await res.json();
      if (!data.items) { setResults([]); setLoading(false); return; }
      setResults(data.items.map(parseBook));
    } catch(e) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleAdd = (book, edId) => {
    addBook({ ...book, id: Date.now() });
    setAdded(prev => new Set([...prev, edId || book.id]));
    setSelectedBook(null);
  };

  const openEditions = async (book) => {
    try {
      const url = "https://www.googleapis.com/books/v1/volumes?q=intitle:" + encodeURIComponent(book.title) + "+inauthor:" + encodeURIComponent(book.author.split(",")[0]) + "&maxResults=8&orderBy=relevance";
      const res = await fetch(url);
      const data = await res.json();
      const editions = (data.items || [book]).map(parseBook);
      setSelectedBook({ ...book, editions });
    } catch {
      setSelectedBook({ ...book, editions: [book] });
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F3EE" }}>
      {selectedBook && (
        <EditionModal book={selectedBook} onClose={() => setSelectedBook(null)} onAdd={handleAdd} added={added} />
      )}

      <div style={{ padding:"20px 16px 14px", background:"#F7F3EE", borderBottom:"0.5px solid #D9C9B8", flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:500, color:"#2C1F14", textAlign:"center", marginBottom:14 }}>Ricerca</div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, position:"relative" }}>
            {!query && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#8B7355", pointerEvents:"none" }}>🔍</span>}
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Titolo, autore o ISBN..."
              style={{ width:"100%", padding:"10px 12px 10px "+(query?"14px":"36px"), borderRadius:12, border:"0.5px solid #D9C9B8", background:"#fff", fontSize:14, color:"#2C1F14", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            />
          </div>
          <button onClick={doSearch} style={{ background:"#2C3E50", color:"white", border:"none", borderRadius:8, padding:"10px 14px", fontSize:13, cursor:"pointer" }}>Cerca</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:6, overflowX:"auto", padding:"12px 16px 0", flexShrink:0, scrollbarWidth:"none" }}>
        {FILTERS.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{ fontSize:12, padding:"5px 12px", borderRadius:100, border:"0.5px solid", borderColor:filter===f?"#2C3E50":"#D9C9B8", background:filter===f?"#2C3E50":"#fff", color:filter===f?"white":"#8B7355", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{f}</div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
        {!searched ? (
          <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
            <div style={{ fontSize:36, marginBottom:12, color:"#D9C9B8" }}>📚</div>
            <div style={{ fontSize:15, fontWeight:500, color:"#2C1F14", marginBottom:6 }}>cerca il tuo prossimo libro</div>
            <div style={{ fontSize:13, color:"#8B7355", lineHeight:1.5 }}>titolo, nome dell'autore o ISBN</div>
          </div>
        ) : loading ? (
          Array(4).fill(0).map((_,i) => (
            <div key={i} style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12 }}>
              <div style={{ width:52, height:72, borderRadius:6, background:"linear-gradient(90deg,#E8E0D8 25%,#F2EAE0 50%,#E8E0D8 75%)", backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />
              <div style={{ flex:1 }}>
                <div style={{ height:12, background:"#EDE3D6", borderRadius:4, width:"80%", marginBottom:8 }} />
                <div style={{ height:12, background:"#EDE3D6", borderRadius:4, width:"50%" }} />
              </div>
            </div>
          ))
        ) : results.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
            <div style={{ fontSize:36, marginBottom:12, color:"#D9C9B8" }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:500, color:"#2C1F14", marginBottom:6 }}>nessun risultato</div>
            <div style={{ fontSize:13, color:"#8B7355" }}>prova con un altro titolo o autore</div>
          </div>
        ) : (
          results.map(b => (
            <div key={b.id} style={{ background:"#fff", border:"0.5px solid #D9C9B8", borderRadius:12, padding:12, marginBottom:8, display:"flex", gap:12 }}>
              <div style={{ width:52, height:72, borderRadius:6, flexShrink:0, overflow:"hidden", background:"#EDE3D6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {b.cover
                  ? <img src={b.cover} alt={b.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => e.target.style.display="none"} />
                  : <span style={{ fontSize:24 }}>📖</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, color:"#2C1F14", marginBottom:2, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{b.title}</div>
                <div style={{ fontSize:12, color:"#8B7355", marginBottom:6 }}>{b.author}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                  {b.genre && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:100, border:"0.5px solid #D9C9B8", color:"#8B7355" }}>{b.genre}</span>}
                  {b.pages && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:100, border:"0.5px solid #D9C9B8", color:"#8B7355" }}>{b.pages} pag.</span>}
                  {b.year && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:100, border:"0.5px solid #D9C9B8", color:"#8B7355" }}>{b.year}</span>}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => { addBook({...b,id:Date.now()}); setAdded(prev=>new Set([...prev,b.id])); }} style={{ fontSize:12, padding:"5px 10px", borderRadius:8, border:"0.5px solid", borderColor:added.has(b.id)?"#3D5A80":"#2C3E50", background:added.has(b.id)?"#3D5A80":"none", color:added.has(b.id)?"white":"#2C3E50", cursor:"pointer", fontFamily:"inherit" }}>
                    {added.has(b.id) ? "✓ aggiunto" : "+ aggiungi"}
                  </button>
                  <button onClick={() => openEditions(b)} style={{ fontSize:12, padding:"5px 10px", borderRadius:8, border:"0.5px solid #D9C9B8", color:"#8B7355", background:"none", cursor:"pointer", fontFamily:"inherit" }}>
                    edizioni
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <NavBar current={currentScreen} nav={nav} />
    </div>
  );
}
import { useState } from "react";
import Home from "./screens/Home";
import Cerca from "./screens/Cerca";
import Libreria from "./screens/Libreria";
import Statistiche from "./screens/Statistiche";
import ConsiglAI from "./screens/ConsiglAI";

// Funzione per ottenere copertina da Open Library
export async function fetchCover(title, author) {
  try {
    const q = encodeURIComponent(title + " " + author);
    const res = await fetch("https://openlibrary.org/search.json?q=" + q + "&limit=1&fields=cover_i");
    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;
    if (coverId) return "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg";
    return null;
  } catch { return null; }
}

const SAMPLE_BOOKS = [
  { id: 1, title: "Il nome della rosa", author: "Umberto Eco", cover: null, pages: 502, pagesRead: 328, status: "reading", genre: "Fiction", added: "2026-06-01" },
  { id: 2, title: "Sapiens", author: "Yuval Noah Harari", cover: null, pages: 443, pagesRead: 443, status: "done", genre: "Saggistica", added: "2026-05-10" },
  { id: 3, title: "Stoner", author: "John Williams", cover: null, pages: 278, pagesRead: 278, status: "done", genre: "Fiction", added: "2026-04-22" },
  { id: 4, title: "La società dello spettacolo", author: "Guy Debord", cover: null, pages: 154, pagesRead: 60, status: "reading", genre: "Filosofia", added: "2026-06-08" },
  { id: 5, title: "Lolita", author: "Vladimir Nabokov", cover: null, pages: 336, pagesRead: 0, status: "to-read", genre: "Fiction", added: "2026-06-10" },
  { id: 6, title: "Furore", author: "John Steinbeck", cover: null, pages: 619, pagesRead: 0, status: "to-read", genre: "Fiction", added: "2026-06-11" },
  { id: 7, title: "Le città invisibili", author: "Italo Calvino", cover: null, pages: 165, pagesRead: 165, status: "done", genre: "Fiction", added: "2026-03-15" },
  { id: 8, title: "Il barone rampante", author: "Italo Calvino", cover: null, pages: 244, pagesRead: 120, status: "paused", genre: "Fiction", added: "2026-04-01" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [bgColor, setBgColor] = useState("#2C3E50");
  const [bgImage, setBgImage] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const addBook = (book) => {
    setBooks(prev => {
      if (prev.find(b => b.id === book.id)) return prev;
      return [{ ...book, pagesRead: 0, status: "to-read", added: new Date().toISOString().split("T")[0] }, ...prev];
    });
  };

  const updateBook = (id, changes) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
  };

  const removeBook = (id) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const screens = { home: Home, cerca: Cerca, libreria: Libreria, statistiche: Statistiche, ai: ConsiglAI };
  const Screen = screens[screen] || Home;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", position: "relative" }}>
        <Screen
          books={books}
          addBook={addBook}
          updateBook={updateBook}
          removeBook={removeBook}
          nav={setScreen}
          currentScreen={screen}
          bgColor={bgColor}
          setBgColor={setBgColor}
          bgImage={bgImage}
          setBgImage={setBgImage}
          avatar={avatar}
          setAvatar={setAvatar}
          fetchCover={fetchCover}
        />
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";

export default function BookCover({ title, author, cover, size = { w: 44, h: 62 }, style = {} }) {
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

  const baseStyle = {
    width: size.w,
    height: size.h,
    borderRadius: 6,
    flexShrink: 0,
    overflow: "hidden",
    background: "#EDE3D6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style
  };

  if (loading) return (
    <div style={{ ...baseStyle, background: "linear-gradient(90deg, #E8E0D8 25%, #F2EAE0 50%, #E8E0D8 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite linear" }} />
  );

  return (
    <div style={baseStyle}>
      {src
        ? <img src={src} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setSrc(null)} />
        : <span style={{ fontSize: size.w > 40 ? 24 : 16 }}>📖</span>
      }
    </div>
  );
}
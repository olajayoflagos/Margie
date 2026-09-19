import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Seo from "../seo/Seo";
import "./Blog.css";

export default function BlogList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );
        const snap = await getDocs(q);
        setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="page blog-list">
      <Seo
        title="Guides & Stories | Margie's, Gbagada Lagos"
        description="Local guides, travel tips, and stories from Margie's in Gbagada, Lagos."
        path="/blog"
      />
      <div className="container">
        <h1>Guides &amp; Stories</h1>
        {loading && <p>Loading…</p>}
        {!loading && articles.length === 0 && <p>No articles published yet.</p>}
        <div className="blog-list__grid">
          {articles.map((a) => (
            <Link to={`/blog/${a.slug}`} key={a.id} className="blog-card">
              {a.coverImage && <img src={a.coverImage} alt={a.title} />}
              <h2>{a.title}</h2>
              {a.excerpt && <p>{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

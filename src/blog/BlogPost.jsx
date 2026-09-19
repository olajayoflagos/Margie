import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Seo from "../seo/Seo";
import { articleSchema, breadcrumbSchema } from "../seo/schema";
import "./Blog.css";

export default function BlogPost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | missing

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("slug", "==", slug),
          where("status", "==", "published"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setStatus("missing");
          return;
        }
        setArticle({ id: snap.docs[0].id, ...snap.docs[0].data() });
        setStatus("found");
      } catch (err) {
        console.error(err);
        setStatus("missing");
      }
    })();
  }, [slug]);

  if (status === "loading") return <p className="page page--center">Loading…</p>;
  if (status === "missing") {
    return (
      <main className="page page--center">
        <h1>Article not found</h1>
        <p>
          <Link to="/blog">Back to guides &amp; stories</Link>
        </p>
      </main>
    );
  }

  const path = `/blog/${article.slug}`;

  return (
    <main className="page blog-post">
      <Seo
        title={`${article.title} | Margie's`}
        description={article.excerpt || article.title}
        path={path}
        image={article.coverImage}
        schema={[
          articleSchema(article, path),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides & Stories", path: "/blog" },
            { name: article.title, path },
          ]),
        ]}
      />
      <div className="container">
        <h1>{article.title}</h1>
        {article.coverImage && <img className="blog-post__cover" src={article.coverImage} alt={article.title} />}
        {/* Content is authored in the admin's rich-text editor and stored as
            sanitized HTML - see AdminDashboard's Articles tab. */}
        <div className="blog-post__body" dangerouslySetInnerHTML={{ __html: article.body }} />
      </div>
    </main>
  );
}

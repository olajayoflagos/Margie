import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { db, storage } from "./firebase";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const emptyDraft = { title: "", slug: "", excerpt: "", coverImage: "", body: "" };

/**
 * Articles tab for AdminDashboard: a WordPress-style editor (ReactQuill
 * toolbar - headings, bold/italic, links, images, lists) backed by a
 * Firestore `articles` collection and Firebase Storage for uploaded images.
 */
export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "articles"), orderBy("createdAt", "desc")));
    setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const startEdit = (article) => {
    setEditingId(article.id);
    setDraft({
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      coverImage: article.coverImage || "",
      body: article.body || "",
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `articles/covers/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setDraft((d) => ({ ...d, coverImage: url }));
    } catch (err) {
      console.error(err);
      setNotice("Cover image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const quillRef = useRef(null);

  // Custom image handler so images dropped into the editor body also go to
  // Firebase Storage (rather than being embedded as base64 blobs, which
  // would bloat the article document and never get properly served).
  const quillImageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const editor = quillRef.current?.getEditor();
      if (!editor) return;
      try {
        const path = `articles/body/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const range = editor.getSelection(true);
        editor.insertEmbed(range ? range.index : 0, "image", url);
      } catch (err) {
        console.error(err);
        setNotice("Image upload failed.");
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          ["link", "image"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
        handlers: {
          image: quillImageHandler,
        },
      },
    }),
    []
  );

  const save = async (status) => {
    if (!draft.title.trim()) {
      setNotice("Title is required.");
      return;
    }
    const slug = draft.slug.trim() || slugify(draft.title);
    setSaving(true);
    try {
      const payload = {
        title: draft.title,
        slug,
        excerpt: draft.excerpt,
        coverImage: draft.coverImage,
        body: draft.body,
        status,
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, "articles", editingId), payload);
      } else {
        await addDoc(collection(db, "articles"), {
          ...payload,
          createdAt: serverTimestamp(),
          publishedAt: status === "published" ? serverTimestamp() : null,
        });
      }
      setNotice(status === "published" ? "Published." : "Saved as draft.");
      startNew();
      load();
    } catch (err) {
      console.error(err);
      setNotice("Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    await deleteDoc(doc(db, "articles", id));
    load();
  };

  return (
    <section className="admin-articles">
      <h2>Articles</h2>

      <div className="admin-articles__editor">
        <input
          type="text"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
        <input
          type="text"
          placeholder="URL slug (auto-generated from title if left blank)"
          value={draft.slug}
          onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Short excerpt (for the blog list & meta description)"
          value={draft.excerpt}
          onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
        />

        <label className="admin-articles__cover-label">
          Cover image
          <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
        </label>
        {draft.coverImage && <img className="admin-articles__cover-preview" src={draft.coverImage} alt="Cover preview" />}

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={draft.body}
          onChange={(html) => setDraft((d) => ({ ...d, body: html }))}
          modules={modules}
        />

        {notice && <p className="admin-articles__notice">{notice}</p>}

        <div className="admin-articles__actions">
          <button disabled={saving} onClick={() => save("draft")}>
            Save draft
          </button>
          <button disabled={saving} onClick={() => save("published")} className="admin-articles__publish">
            Publish
          </button>
          {editingId && (
            <button type="button" onClick={startNew}>
              New article
            </button>
          )}
        </div>
      </div>

      <div className="admin-articles__list">
        <h3>All articles ({articles.length})</h3>
        {loading && <p>Loading…</p>}
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.status}</td>
                <td>
                  <button onClick={() => startEdit(a)}>Edit</button>
                </td>
                <td>
                  <button onClick={() => remove(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Toast, { toast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../api/axios";
import '../Style/Projects.css'
export default function Projects() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState(null);


  const [title, setTitle]           = useState("");
  const [subtitle, setSubtitle]     = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl]               = useState("");
  const [images, setImages]         = useState([]); // file objects
  const [previews, setPreviews]     = useState([]); // preview urls
  const [existingImages, setExistingImages] = useState([]); //  saved

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/projects");
      setItems(Array.isArray(data) ? data : data.projects || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setTitle(""); setSubtitle(""); setDescription("");
    setUrl(""); setImages([]); setPreviews([]); setExistingImages([]);
    setModal("create");
  };

  const openEdit = (item) => {
    setTitle(item.title || "");
    setSubtitle(item.subtitle || "");
    setDescription(item.description || "");
    setUrl(item.url || "");
    setImages([]);
    setPreviews([]);
    setExistingImages(item.images || []);
    setModal({ mode: "edit", id: item._id });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!title) return toast.error("Title is required");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      formData.append("url", url);
      images.forEach((img) => formData.append("images", img));

      if (modal === "create") {
        if (images.length === 0) return toast.error("Please select at least one image");
        await API.post("/projects/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project created!");
      } else {
        await API.put(`/projects/${modal.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated!");
      }

      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/projects/delete/${id}`);
      toast.success("Project deleted");
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Toast />
      <div className="layout">
        <Sidebar />
        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-title">Projects</div>
              <div className="page-sub">{items.length} total</div>
            </div>
            <button className="btn-add" onClick={openCreate}>＋ Add Project</button>
          </div>

          {loading ? (
            <div className="loading-wrap"><span className="spinner" /></div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◈</div>
              <div className="empty-text">No projects yet.</div>
            </div>
          ) : (
            <div className="cards-grid">
              {items.map((item) => (
                <div className="card" key={item._id}>
                  {item.images?.[0] && (
                    <img className="card-img" src={item.images[0]} alt={item.title} />
                  )}
                  <div className="card-title">{item.title}</div>
                  {item.subtitle && (
                    <div className="card-subtitle">{item.subtitle}</div>
                  )}
                  <div className="card-desc">{item.description}</div>
                  <div className="card-actions">
                    <button className="btn-edit" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn-del" onClick={() => setConfirm(item._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">
              {modal === "create" ? "New Project" : "Edit Project"}
            </div>

            <div className="fgroup">
              <label className="flabel">Title</label>
              <input className="finput" placeholder="Project name"
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

          <div className="fgroup">
  <label className="flabel">Subtitle <span style={{color:"var(--muted)",fontWeight:400}}>— max 60 chars</span></label>
  <input
    className="finput"
    placeholder="Short tagline (one line only)"
    maxLength={60}
    value={subtitle}
    onChange={(e) => setSubtitle(e.target.value)}
  />
  <div style={{fontSize:"11px",color:"var(--muted)",marginTop:"6px",textAlign:"right"}}>
    {subtitle.length}/60
  </div>
</div>

            <div className="fgroup">
              <label className="flabel">Description</label>
              <textarea className="finput" placeholder="Project description..."
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="fgroup">
              <label className="flabel">Project URL</label>
              <input className="finput" placeholder="https://..."
                value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>

          // Replace the entire images fgroup with this:

<div className="fgroup">
  <label className="flabel">
    Images {modal !== "create" && "(leave empty to keep existing)"}
  </label>

  {/* Combined existing + new previews in a row */}
  <div className="img-preview-row">
    {/* Existing images */}
    {existingImages.map((src, i) => (
      <div className="img-preview-wrap" key={`ex-${i}`}>
        <img src={src} alt="" className="img-preview-thumb" />
        <button
          className="img-preview-del"
          onClick={() => setExistingImages((p) => p.filter((_, idx) => idx !== i))}
        >
          ✕
        </button>
      </div>
    ))}

    {/* New selected images */}
    {previews.map((src, i) => (
      <div className="img-preview-wrap" key={`new-${i}`}>
        <img src={src} alt="" className="img-preview-thumb" />
        <button
          className="img-preview-del"
          onClick={() => {
            setImages((p) => p.filter((_, idx) => idx !== i));
            setPreviews((p) => p.filter((_, idx) => idx !== i));
          }}
        >
          ✕
        </button>
      </div>
    ))}

    {/* Add more button — only show if total < 4 */}
    {existingImages.length + images.length < 4 && (
      <label className="img-add-btn">
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const remaining = 4 - existingImages.length - images.length;
            const allowed = files.slice(0, remaining);
            if (files.length > remaining) {
              toast.error(`Max 4 images total. Only ${remaining} more allowed.`);
            }
            setImages((p) => [...p, ...allowed]);
            setPreviews((p) => [
              ...p,
              ...allowed.map((f) => URL.createObjectURL(f)),
            ]);
          }}
        />
        <span>＋</span>
      </label>
    )}
  </div>

  <div className="img-count-hint">
    {existingImages.length + images.length}/4 images
  </div>
</div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : "Save →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          msg="This project will be permanently deleted."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
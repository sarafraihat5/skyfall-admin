import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Toast, { toast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../api/axios";
import "../Style/Projects.css";

export default function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

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
    setTitle("");
    setSubtitle("");
    setDescription("");
    setUrl("");
    setImages([]);
    setPreviews([]);
    setExistingImages([]);
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

  const handleSave = async () => {
    if (!title) return toast.error("Title is required");

    if (url && !isValidUrl(url)) {
      return toast.error("Invalid URL");
    }

    if (existingImages.length + images.length > 4) {
      return toast.error("Maximum 4 images allowed");
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      formData.append("url", url);

      images.forEach((img) => formData.append("images", img));

      if (modal === "create") {
        if (images.length === 0)
          return toast.error("Please select at least one image");

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

            <button className="btn-add" onClick={openCreate}>
              ＋ Add Project
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <span className="spinner" />
            </div>
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
                    <img
                      className="card-img"
                      src={item.images[0]}
                      alt={item.title}
                    />
                  )}

                  <div className="card-title">{item.title}</div>

                  {item.subtitle && (
                    <div className="card-subtitle">{item.subtitle}</div>
                  )}

                  <div className="card-desc">{item.description}</div>

                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-del"
                      onClick={() => setConfirm(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

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
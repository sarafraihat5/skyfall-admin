import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Toast, { toast } from "../components/Toast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../api/axios";
import "../Style/WallOfSuccess.css";

const FIELDS = [
  { key: "heading", label: "Heading", placeholder: "Great service", maxLength: 60 },
  { key: "body", label: "Body", placeholder: "What they said...", type: "textarea", maxLength: 800 },
  { key: "name", label: "Client Name", placeholder: "John Doe", maxLength: 15 },
  { key: "role", label: "Role / Title", placeholder: "CEO at Company", maxLength: 20 },
  { key: "url", label: "Website URL", placeholder: "https://..." },
  { key: "avatar", label: "Avatar", type: "file" },
];

export default function WallOfSuccess() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

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
      const { data } = await API.get("/testimonials");
      setItems(Array.isArray(data) ? data : data.testimonials || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key, value) => {
    setModal((m) => ({
      ...m,
      data: { ...m.data, [key]: value },
    }));
  };

  const handleSave = async () => {
    const { mode, data } = modal;

    if (!data.heading?.trim()) return toast.error("Heading is required");
    if (!data.body?.trim()) return toast.error("Body is required");
    if (!data.name?.trim()) return toast.error("Name is required");
    if (!data.role?.trim()) return toast.error("Role is required");

    if (!data.url?.trim()) return toast.error("Website URL is required");
    if (!isValidUrl(data.url)) return toast.error("Invalid URL");

    if (mode === "create" && !data.avatar)
      return toast.error("Avatar is required");

    setSaving(true);

    try {
      const form = new FormData();

      form.append("heading", data.heading.trim());
      form.append("body", data.body.trim());
      form.append("name", data.name.trim());
      form.append("role", data.role.trim());
      form.append("url", data.url.trim());

      if (data.avatar instanceof File) {
        form.append("avatar", data.avatar);
      }

      if (mode === "create") {
        await API.post("/testimonials", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Story added!");
      } else {
        await API.put(`/testimonials/${data._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Story updated!");
      }

      setModal(null);
      load();
    } catch (e) {
      toast.error(
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/testimonials/${id}`);
      toast.success("Story deleted");
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (item) =>
    setModal({ mode: "edit", data: { ...item } });

  const openCreate = () =>
    setModal({
      mode: "create",
      data: {
        heading: "",
        body: "",
        name: "",
        role: "",
        url: "",
        avatar: null,
      },
    });

  return (
    <>
      <Toast />

      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-title">Wall of Success</div>
              <div className="page-sub">{items.length} stories</div>
            </div>

            <button className="btn-add" onClick={openCreate}>
              ＋ Add Story
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <span className="spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">★</div>
              <div className="empty-text">
                No success stories yet.
              </div>
            </div>
          ) : (
            <div className="cards-grid">
              {items.map((item) => (
                <div className="card" key={item._id}>
                  <div className="testimonial-header">
                    {item.avatar?.url ? (
                      <img
                        className="testimonial-avatar"
                        src={item.avatar.url}
                        alt={item.name}
                        onError={(e) =>
                          (e.target.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="testimonial-avatar-placeholder">
                        {item.name?.[0] || "?"}
                      </div>
                    )}

                    <div className="testimonial-meta">
                      <div className="testimonial-name">
                        {item.name}
                      </div>
                      <div className="testimonial-role">
                        {item.role}
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-heading">
                    {item.heading}
                  </div>
                  <div className="card-desc">{item.body}</div>

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

      {modal && (
        <Modal
          title={
            modal.mode === "create"
              ? "New Story"
              : "Edit Story"
          }
          fields={FIELDS}
          data={modal.data}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {confirm && (
        <ConfirmDialog
          msg="This story will be permanently deleted."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
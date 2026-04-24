import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Toast, { toast } from "../components/Toast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../api/axios";
import "../Style/Services.css";

const FIELDS = [
  {
    key: "title",
    label: "Title",
    placeholder: "Service name",
  },
  {
    key: "description",
    label: "Description",
    placeholder: "What this service includes...",
    type: "textarea",
  },
];

export default function Services() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await API.get("/services");
      setItems(Array.isArray(data) ? data : data.services || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setModal({
      mode: "create",
      data: {
        title: "",
        description: "",
      },
    });
  };

  const openEdit = (item) => {
    setModal({
      mode: "edit",
      data: {
        _id: item._id,
        title: item.title || "",
        description: item.description || "",
      },
    });
  };

  const validateService = (data) => {
    if (!data.title?.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!data.description?.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (data.title.length < 2) {
      toast.error("Title must be at least 2 characters");
      return false;
    }

    if (data.description.length < 5) {
      toast.error("Description must be at least 5 characters");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!modal) return;

    const { mode, data } = modal;

    if (!validateService(data)) return;

    setSaving(true);

    try {
      if (mode === "create") {
        await API.post("/services", {
          title: data.title.trim(),
          description: data.description.trim(),
        });

        toast.success("Service created!");
      } else {
        await API.put(`/services/${data._id}`, {
          title: data.title.trim(),
          description: data.description.trim(),
        });

        toast.success("Service updated!");
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
      await API.delete(`/services/${id}`);
      toast.success("Service deleted");
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
              <div className="page-title">Services</div>
              <div className="page-sub">{items.length} total</div>
            </div>

            <button className="btn-add" onClick={openCreate}>
              ＋ Add Service
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <span className="spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◎</div>
              <div className="empty-text">No services yet.</div>
            </div>
          ) : (
            <div className="cards-grid">
              {items.map((item) => (
                <div className="card" key={item._id}>
                  <div className="card-title">{item.title}</div>
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

      {modal && (
        <Modal
          title={modal.mode === "create" ? "New Service" : "Edit Service"}
          fields={FIELDS}
          data={modal.data}
          onChange={(key, value) =>
            setModal((currentModal) => ({
              ...currentModal,
              data: {
                ...currentModal.data,
                [key]: value,
              },
            }))
          }
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {confirm && (
        <ConfirmDialog
          msg="This service will be permanently deleted."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Toast, { toast } from "../components/Toast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../api/axios";
import "../Style/Services.css";

const FIELDS = [
  { key: "title",       label: "Title",        placeholder: "Service name" },
  { key: "description", label: "Description",  placeholder: "What this service includes...", type: "textarea" },

];

export default function Services() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
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

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const { mode, data } = modal;
    if (!data.title) return toast.error("Title is required");
    setSaving(true);
    try {
      if (mode === "create") {
        await API.post("/services", data);
        toast.success("Service created!");
      } else {
        await API.put(`/services/${data._id}`, data);
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
            <button className="btn-add" onClick={() => setModal({ mode: "create", data: {} })}>
              ＋ Add Service
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap"><span className="spinner" /></div>
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
                    <button className="btn-edit"
                      onClick={() => setModal({ mode: "edit", data: { ...item } })}>
                      Edit
                    </button>
                    <button className="btn-del" onClick={() => setConfirm(item._id)}>
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
          onChange={(k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }))}
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
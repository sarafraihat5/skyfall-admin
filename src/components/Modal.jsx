import "./compoStyle/Modal.css";

export default function Modal({ title, fields, data, onChange, onSave, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>

        {fields.map((f) => (
          <div className="fgroup" key={f.key}>
            <label className="flabel">
              {f.label}
              {f.optional && <span className="flabel-optional"> (optional)</span>}
            </label>

            {f.type === "textarea" ? (
              <textarea
                className="finput"
                placeholder={f.placeholder}
                value={data[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              />

            ) : f.type === "file" ? (
          <div className="file-input-wrap">
  {data[f.key] instanceof File ? (
    <img
      src={URL.createObjectURL(data[f.key])}
      alt="avatar preview"
      className="avatar-preview"
    />
  ) : data[f.key]?.url ? (
    <img
      src={data[f.key].url}
      alt="avatar preview"
      className="avatar-preview"
    />
  ) : null}

  <input
    className="finput finput-file"
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) onChange(f.key, file);
    }}
  />
</div>

            ) : (
              <input
                className="finput"
                type={f.type || "text"}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                value={data[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}

        
            {f.maxLength && f.type !== "file" && (
              <span className="char-count">
                {(data[f.key] || "").length}/{f.maxLength}
              </span>
            )}
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={onSave} disabled={loading}>
            {loading ? <span className="spinner" /> : "Save →"}
          </button>
        </div>
      </div>
    </div>
  );
}
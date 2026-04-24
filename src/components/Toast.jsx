import { useState, useEffect } from "react";
import "./compoStyle/Toast.css";

let _addToast = () => {};

export const toast = {
  success: (msg) => _addToast({ type: "success", msg }),
  error:   (msg) => _addToast({ type: "error", msg }),
  info:    (msg) => _addToast({ type: "info", msg }),
};

export default function Toast() {
  const [list, setList] = useState([]);

  useEffect(() => {
    _addToast = (t) => {
      if (!t?.msg) return; // حماية بسيطة

      const id = Date.now() + Math.random(); // أفضل من Date.now فقط

      setList((prev) => [...prev, { ...t, id }]);

      setTimeout(() => {
        setList((prev) => prev.filter((x) => x.id !== id));
      }, 3500);
    };
  }, []);

  const icons = {
    success: "✓",
    error: "✕",
    info: "i",
  };

  return (
    <div className="toasts">
      {list.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">{icons[t.type] || "i"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
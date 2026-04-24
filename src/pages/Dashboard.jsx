import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import API from "../api/axios";
import "../Style/Dashboard.css";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    projects: 0,
    services: 0,
    success: 0,
  });

  // helper function بدل nested ternary
  const getLength = (res, key) => {
    if (res.status !== "fulfilled") return 0;

    const data = res.value.data;

    if (Array.isArray(data)) return data.length;

    return data?.[key]?.length || 0;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, t] = await Promise.allSettled([
          API.get("/projects"),
          API.get("/services"),
          API.get("/testimonials"),
        ]);

        setCounts({
          projects: getLength(p, "projects"),
          services: getLength(s, "services"),
          success: getLength(t, "testimonials"),
        });
      } catch {
        // optional: ممكن تضيفي toast error
      }
    };

    load();
  }, []);

  return (
    <>
      <Toast />
      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-title">Dashboard</div>
              <div className="page-sub">Welcome back, Admin</div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num">{counts.projects}</div>
              <div className="stat-label">Projects</div>
            </div>

            <div className="stat-card">
              <div className="stat-num">{counts.services}</div>
              <div className="stat-label">Services</div>
            </div>

            <div className="stat-card">
              <div className="stat-num">{counts.success}</div>
              <div className="stat-label">Success Stories</div>
            </div>
          </div>

          <div className="dash-hint">
            Use the sidebar to manage your content. All changes are saved to your backend.
          </div>
        </main>
      </div>
    </>
  );
}
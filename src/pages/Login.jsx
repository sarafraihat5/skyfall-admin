import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Toast, { toast } from "../components/Toast";
import { setAuth } from "../utils/auth";
import "../Style/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Fill all fields");
    }

    if (!isValidEmail(email)) {
      return toast.error("Invalid email format");
    }

    setLoading(true);

    try {
      const { data } = await API.post("/admin/auth/login", {
        email,
        password,
      });

      setAuth(data.token);
      toast.success("Welcome back!");
      setTimeout(() => navigate("/"), 500);
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast />

      <div className="auth-wrap">
        <div className="auth-glow" />

        <div className="auth-card">
          <div className="auth-logo">SKYFALL</div>
          <div className="auth-sub">Admin Control Panel</div>

          <div className="fgroup">
            <label className="flabel">Email</label>
            <input
              className="finput"
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="fgroup">
            <label className="flabel">Password</label>
            <input
              className="finput"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Sign In →"}
          </button>

          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </>
  );
}
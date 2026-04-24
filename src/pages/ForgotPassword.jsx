import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Toast, { toast } from "../components/Toast";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // helper validation
  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSendOtp = async () => {
    if (!email) return toast.error("Enter your email");
    if (!isValidEmail(email)) return toast.error("Invalid email format");

    setLoading(true);
    try {
      await API.post("/admin/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await API.post("/admin/auth/forgot-password", { email });
      toast.success("OTP resent!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp) return toast.error("Enter the OTP");

    if (otp.length !== 6) return toast.error("OTP must be 6 digits");

    if (!newPassword) return toast.error("Enter new password");

    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await API.post("/admin/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success("Password updated! Please login.");

      setTimeout(() => navigate("/login"), 1000);
    } catch (e) {
      toast.error(e.response?.data?.message || "Reset failed");
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

          <div className="auth-sub">
            {step === "email"
              ? "Reset your password"
              : "Enter the OTP we sent you"}
          </div>

          {step === "email" && (
            <>
              <div className="fgroup">
                <label className="flabel">Email</label>
                <input
                  className="finput"
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Send OTP →"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="fgroup">
                <label className="flabel">OTP Code</label>

                <div className="otp-row">
                  <input
                    className="finput"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                  />

                  <button
                    className="btn-ghost"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend
                  </button>
                </div>
              </div>

              <div className="fgroup">
                <label className="flabel">New Password</label>
                <input
                  className="finput"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="fgroup">
                <label className="flabel">Confirm New Password</label>
                <input
                  className="finput"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Reset Password →"}
              </button>
            </>
          )}

          <button
            className="auth-link-btn"
            onClick={() => navigate("/login")}
          >
            ← Back to login
          </button>
        </div>
      </div>
    </>
  );
}
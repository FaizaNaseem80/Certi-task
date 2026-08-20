"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid admin credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred during sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-root" style={{ background: "var(--navy-dark)" }}>
      {/* ── Form Panel ──────────────────────────────────────── */}
      <div className="auth-form-panel" style={{ width: "100%", maxWidth: "500px", margin: "0 auto", padding: "40px" }}>
        <div className="auth-form-inner">
          <div className="auth-mobile-logo" style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <Image src="/app-icon-128.png" alt="CertiTask" width={48} height={48} />
          </div>

          <div className="auth-card" style={{ borderTop: "4px solid var(--gold)" }}>
            <h2 className="auth-heading" style={{ color: "var(--navy-dark)" }}>Super Admin Portal</h2>
            <p className="auth-sub">Secure access to the administrative dashboard</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8">
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Administrator Email
                </label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className={`form-input${error ? " has-error" : ""}`}
                    placeholder="admin@certitask.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="input-wrap">
                  <span className="input-icon">
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    className={`form-input${error ? " has-error" : ""}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="field-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="login-submit"
                className={`btn-primary mt-4${loading ? " loading" : ""}`}
                disabled={loading || !email || !password}
                style={{ background: "var(--navy-dark)" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Authenticating…
                  </>
                ) : (
                  "Secure Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

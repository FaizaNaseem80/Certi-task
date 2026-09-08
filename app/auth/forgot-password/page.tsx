"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send reset email.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-centered">
      {/* Decorative rings */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        border: "1px solid rgba(201,162,39,0.08)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        border: "1px solid rgba(201,162,39,0.12)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div className="auth-centered-card">
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Image src="/app-icon-256.png" alt="CertiTask" width={52} height={52} style={{ borderRadius: 14 }} />
        </div>

        {!sent ? (
          <>
            <h1 className="auth-heading text-center" style={{ textAlign: "center" }}>
              Forgot password?
            </h1>
            <p className="auth-sub" style={{ textAlign: "center", marginBottom: 28 }}>
              No worries — enter your email and we&apos;ll send you password reset instructions.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  Email address
                </label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <MailIcon />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    className={`form-input${error ? " has-error" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                {error && (
                  <span className="field-error">{error}</span>
                )}
              </div>

              <button
                type="submit"
                id="forgot-submit"
                className={`btn-primary mt-4${loading ? " loading" : ""}`}
                disabled={loading || !email}
              >
                {loading ? (
                  <><span className="spinner" />Sending reset code…</>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link href="/auth/login" className="btn-ghost" style={{ display: "inline-flex" }}>
                <ArrowLeftIcon />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          /* ── Success state ── */
          <div style={{ textAlign: "center" }}>
            <div className="success-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h2 className="auth-heading" style={{ textAlign: "center", marginBottom: 12 }}>
              Check your inbox!
            </h2>
            <p className="auth-sub" style={{ textAlign: "center", marginBottom: 24 }}>
              If the account exists, we&apos;ve sent a password reset link to{" "}
              <strong style={{ color: "var(--navy)" }}>{email}</strong>.
            </p>

            <div className="info-box" style={{ marginBottom: 24 }}>
              Didn&apos;t receive it? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                style={{ background: "none", border: "none", color: "var(--gold)", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "inherit" }}
              >
                try again with a different email.
              </button>
            </div>

            <Link href="/auth/reset-password" className="btn-primary" style={{ display: "flex", textDecoration: "none" }}>
              Open Reset Link →
            </Link>

            <div style={{ marginTop: 16 }}>
              <Link href="/auth/login" className="btn-ghost" style={{ display: "inline-flex" }}>
                <ArrowLeftIcon />
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-navy-dark text-paper lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-gold/15 bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-20">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/app-icon-128.png" alt="CertiTask" width={48} height={48} />
            <span className="text-2xl font-bold tracking-tight">Certi<span className="text-gold">Task</span></span>
          </div>
          <div className="mt-32 max-w-xl">
            <p className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-gold"><span className="h-px w-10 bg-gold" /> Private workspace</p>
            <h1 className="mt-8 text-5xl font-black leading-[0.98] tracking-[-0.04em] xl:text-7xl">Keep the <span className="text-gold">proof</span> moving.</h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/65">Review projects, protect the integrity of certificates, and keep the CertiTask network accountable.</p>
          </div>
        </div>
        <div className="relative z-10 grid max-w-lg grid-cols-3 border-t border-paper/15 pt-5 text-xs text-paper/50"><div><strong className="block text-lg text-paper">01</strong>Review</div><div><strong className="block text-lg text-paper">02</strong>Protect</div><div><strong className="block text-lg text-paper">03</strong>Resolve</div></div>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-10 text-ink sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/app-icon-128.png" alt="CertiTask" width={42} height={42} /><span className="text-2xl font-bold tracking-tight text-navy">Certi<span className="text-gold">Task</span></span></div>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Administrator access</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-navy">Welcome back.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">Sign in to manage the platform and verify the work behind every credential.</p>
          </div>

          <div className="border border-navy/15 bg-white p-6 shadow-[8px_8px_0_var(--gold-light)] sm:p-8">
            <div className="mb-8 flex items-center justify-between border-b border-navy/10 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy/50">Access level</p><p className="mt-1 text-sm font-bold text-navy">Super administrator</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gold/10 text-lg text-navy">✓</div></div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Email */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-navy/65" htmlFor="login-email">
                  Administrator email
                </label>
                <div className="flex items-center border-b-2 border-navy/20 bg-paper/60 transition-colors focus-within:border-gold">
                  <span className="ml-3 text-navy/45">
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full border-0 bg-transparent px-3 py-4 text-sm text-ink outline-none placeholder:text-ink/35"
                    placeholder="admin@certitask.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-navy/65" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="flex items-center border-b-2 border-navy/20 bg-paper/60 transition-colors focus-within:border-gold">
                  <span className="ml-3 text-navy/45">
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    className="w-full border-0 bg-transparent px-3 py-4 text-sm text-ink outline-none placeholder:text-ink/35"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="mr-3 text-navy/45 transition-colors hover:text-gold"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="login-submit"
                className="mt-2 flex w-full items-center justify-center gap-2 bg-navy-dark px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !email || !password}
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
          <p className="mt-6 text-center text-xs text-ink/45">CertiTask administration · Protected access</p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

interface Doc { id: string; type: string; mimeType: string; sizeBytes: number; createdAt: string }
interface Req {
  id: string; kind: "IDENTITY" | "ORGANIZATION"; status: string; submittedAt: string; reviewedAt: string | null; reviewedBy: string | null; rejectionReason: string | null;
  formData: { legalName?: string; idType?: string; idLast4?: string; authorizedPersonName?: string; registrationNumber?: string } | null;
  user: { id: string; name: string; email: string; role: string; clientType: string | null; website: string | null; location: string | null; createdAt: string; emailVerifiedAt: string | null };
  documents: Doc[];
}

const DOC_LABEL: Record<string, string> = { ID_FRONT: "ID front", ID_BACK: "ID back", ORG_REGISTRATION: "Registration document", OTHER: "Other" };
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

/** Admin review queue for identity / organization verification (Phase 2). */
export function VerificationQueue({ onDecided }: { onDecided: () => void }) {
  const [filter, setFilter] = useState<"PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "ALL">("PENDING_REVIEW");
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Req | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/verifications?status=${filter}`, { cache: "no-store" });
    if (res.ok) setRequests((await res.json()).requests ?? []);
    setLoading(false);
  }, [filter]);
  useEffect(() => { const t = setTimeout(() => { void load(); }, 0); return () => clearTimeout(t); }, [load]);

  async function decide(decision: "APPROVE" | "REJECT") {
    if (!open) return;
    if (decision === "APPROVE" && !confirm(`Approve ${open.user.name}? Their legal name will be set to "${open.formData?.legalName}" and any held certificates will be issued.`)) return;
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/verifications/${open.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, reason }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    setOpen(null); setReason("");
    await load();
    onDecided();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["PENDING_REVIEW", "VERIFIED", "REJECTED", "ALL"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter === f ? "bg-navy text-white border-navy" : "bg-white text-gray-700 border-gray-200 hover:border-navy"}`}>
            {f === "PENDING_REVIEW" ? "Pending" : f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Kind</th>
                <th className="px-6 py-4">Legal name on request</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">{filter === "PENDING_REVIEW" ? "Queue is empty. 🎉" : "Nothing here."}</td></tr>
              ) : requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy">{r.user.name}</div>
                    <div className="text-xs text-gray-500">{r.user.email} · {r.user.role === "CLIENT" ? `Client (${r.user.clientType === "ORGANIZATION" ? "org" : "individual"})` : "Talent"}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.kind === "ORGANIZATION" ? "Organization" : "Identity"}</td>
                  <td className="px-6 py-4 text-gray-600">{r.formData?.legalName ?? "—"}<div className="text-xs text-gray-400">{r.formData?.idType} ···{r.formData?.idLast4}</div></td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmt(r.submittedAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.status === "VERIFIED" ? "bg-green-100 text-green-700" : r.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{r.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setOpen(r); setReason(""); setError(null); }} className="text-blue-600 hover:text-blue-800 font-medium">{r.status === "PENDING_REVIEW" ? "Review" : "View"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="p-5 border-b flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold text-navy">{open.kind === "ORGANIZATION" ? "Organization verification" : "Identity verification"} — {open.user.name}</h3>
                <p className="text-xs text-gray-500">{open.user.email} · account created {fmt(open.user.createdAt)} · email {open.user.emailVerifiedAt ? "confirmed" : "NOT confirmed"}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3 text-sm">
                <div className="font-bold text-navy text-xs uppercase tracking-wide">What they typed</div>
                <Row k={open.kind === "ORGANIZATION" ? "Organization legal name" : "Legal name"} v={open.formData?.legalName} />
                {open.kind === "ORGANIZATION" && <Row k="Registration no." v={open.formData?.registrationNumber} />}
                {open.kind === "ORGANIZATION" && <Row k="Authorized person" v={open.formData?.authorizedPersonName} />}
                <Row k="ID type" v={open.formData?.idType} />
                <Row k="ID ends with" v={open.formData?.idLast4 ? `···${open.formData.idLast4}` : undefined} />
                <div className="font-bold text-navy text-xs uppercase tracking-wide pt-3">Profile</div>
                <Row k="Display name" v={open.user.name} />
                <Row k="Website" v={open.user.website} />
                <Row k="Location" v={open.user.location} />
                {open.status !== "PENDING_REVIEW" && (
                  <>
                    <div className="font-bold text-navy text-xs uppercase tracking-wide pt-3">Decision</div>
                    <Row k="Status" v={open.status} />
                    <Row k="Reviewed" v={fmt(open.reviewedAt)} />
                    {open.rejectionReason && <Row k="Reason" v={open.rejectionReason} />}
                  </>
                )}
                <div className="pt-3 text-xs text-gray-500 leading-relaxed">
                  <strong>Check:</strong> name on the document matches the typed legal name exactly; ID number ends with the digits shown; document is legible, not expired, and all corners visible{open.kind === "ORGANIZATION" ? "; registration number matches the certificate" : ""}.
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="font-bold text-navy text-xs uppercase tracking-wide">Documents ({open.documents.length})</div>
                {open.documents.length === 0 && <p className="text-sm text-gray-500">No documents (purged or missing).</p>}
                {open.documents.map(d => (
                  <div key={d.id} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center px-3 py-2 bg-gray-50 text-xs">
                      <span className="font-bold text-navy">{DOC_LABEL[d.type] ?? d.type}</span>
                      <span className="text-gray-500">{d.sizeBytes < 1024 ? "<1" : Math.round(d.sizeBytes / 1024)} KB · <a href={`/api/verification/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">open in new tab</a></span>
                    </div>
                    {d.mimeType === "application/pdf"
                      ? <iframe src={`/api/verification/documents/${d.id}`} title={DOC_LABEL[d.type]} className="w-full h-[420px] bg-white" />
                      // eslint-disable-next-line @next/next/no-img-element
                      : <img src={`/api/verification/documents/${d.id}`} alt={DOC_LABEL[d.type]} className="w-full max-h-[420px] object-contain bg-gray-100" />}
                  </div>
                ))}
              </div>
            </div>

            {open.status === "PENDING_REVIEW" && (
              <div className="p-5 border-t bg-gray-50 space-y-3">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="v-reason">Reason (required to reject; shown to the applicant)</label>
                <textarea id="v-reason" value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy outline-none" placeholder="e.g. The name on the ID (Ayesha Khan) does not match the legal name typed (Aisha Khan)." />
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button disabled={busy} onClick={() => decide("REJECT")} className="px-5 py-2 rounded-lg border border-red-300 text-red-700 font-bold text-sm hover:bg-red-50 disabled:opacity-50">Reject</button>
                  <button disabled={busy} onClick={() => decide("APPROVE")} className="px-6 py-2 rounded-lg bg-green-700 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : "Approve ✓"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return <div className="flex justify-between gap-3"><span className="text-gray-500">{k}</span><span className="font-medium text-navy text-right break-words">{v || "—"}</span></div>;
}

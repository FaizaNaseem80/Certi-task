"use client";

import Link from "next/link";
import { EmptyState, SectionHeader } from "@/components/dashboard/ui";
import { CertificateGrid } from "@/components/client/CertificatesTab";
import type { CertificateDto, CertificateHoldDto } from "@/lib/types";
import type { TalentTab } from "@/app/talent/dashboard/page";

export function CertificatesTab({ certificates, holds, talentId, goTo }: { certificates: CertificateDto[]; holds: CertificateHoldDto[]; talentId: string; goTo: (t: TalentTab) => void }) {
  return (
    <div>
      <SectionHeader icon="🏅" title="My certificates" subtitle="Each one is publicly verifiable by its ID. Share the link or download the PDF."
        action={<Link href={`/talents/${talentId}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", textDecoration: "none", padding: "8px 14px", border: "1px solid var(--navy)", borderRadius: 8 }}>View public profile ↗</Link>} />
      {holds.length > 0 && (
        <div style={{ background: "rgba(236,201,75,0.10)", border: "1px solid rgba(236,201,75,0.35)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#744210", marginBottom: 6 }}>🏅 {holds.length} certificate{holds.length > 1 ? "s" : ""} waiting for your identity verification</div>
          <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 13, color: "#744210" }}>
            {holds.map(h => <li key={h.id}>{h.project.title} — {h.project.client.name}</li>)}
          </ul>
          <button onClick={() => goTo("verification")} style={{ padding: "8px 14px", background: "#744210", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Verify my identity →</button>
        </div>
      )}
      {certificates.length === 0 ? (
        <EmptyState icon="🎓" title="No certificates yet" hint="Complete a project and get it approved by the client to earn your first one." />
      ) : (
        <CertificateGrid certificates={certificates} mode="earned" />
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { EmptyState, SectionHeader } from "@/components/dashboard/ui";
import { CertificateGrid } from "@/components/client/CertificatesTab";
import type { CertificateDto } from "@/lib/types";

export function CertificatesTab({ certificates, talentId }: { certificates: CertificateDto[]; talentId: string }) {
  return (
    <div>
      <SectionHeader icon="🏅" title="My certificates" subtitle="Each one is publicly verifiable by its ID. Share the link or download the PDF."
        action={<Link href={`/talents/${talentId}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", textDecoration: "none", padding: "8px 14px", border: "1px solid var(--navy)", borderRadius: 8 }}>View public profile ↗</Link>} />
      {certificates.length === 0 ? (
        <EmptyState icon="🎓" title="No certificates yet" hint="Complete a project and get it approved by the client to earn your first one." />
      ) : (
        <CertificateGrid certificates={certificates} mode="earned" />
      )}
    </div>
  );
}

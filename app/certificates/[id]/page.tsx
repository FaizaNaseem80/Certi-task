import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PrintButton } from "@/components/PrintButton";
import { CLIENT_TYPE_LABEL } from "@/lib/enums";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Public certificate page (FR-S10). Reachable by certId (printed) or internal id. */
export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cert, session] = await Promise.all([
    prisma.certificate.findFirst({
      where: { OR: [{ certId: id.toUpperCase() }, { id }] },
      include: { client: { select: { id: true, name: true } }, talent: { select: { id: true } }, project: { select: { id: true, category: true } } },
    }).catch((e) => { console.error("Error fetching certificate:", e); return null; }),
    getSession(),
  ]);

  if (!cert) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f9fc", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ color: "#07203b", margin: "0 0 10px" }}>Certificate not found</h2>
          <p style={{ color: "#6b7280", margin: 0 }}>No certificate matches this ID. Check the ID printed on the certificate and try again.</p>
          <Link href="/verify" style={{ display: "inline-block", marginTop: 16, color: "#07203b", fontWeight: 700 }}>Go to verification →</Link>
        </div>
      </div>
    );
  }

  const isRevoked = cert.status === "REVOKED";
  const isDisputed = cert.status === "DISPUTED";
  const isValid = !isRevoked && !isDisputed;
  const borderColor = isRevoked ? "#B91C1C" : isDisputed ? "#B45309" : "#D4A017";
  const canDownload = isValid && session && (session.role === "ADMIN" || session.userId === cert.talentId || session.userId === cert.clientId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f9fc', padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '860px', background: '#fff', borderRadius: 12, padding: '48px 40px', boxShadow: '0 12px 40px rgba(7,32,59,0.09)', border: `2px solid ${borderColor}`, position: 'relative' }}>

        {!isValid && (
          <div role="alert" style={{ marginBottom: 24, padding: '14px 18px', borderRadius: 8, background: isRevoked ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${isRevoked ? '#FECACA' : '#FDE68A'}`, color: isRevoked ? '#991B1B' : '#92400E' }}>
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{isRevoked ? 'Certificate revoked' : 'Certificate under dispute'}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {isRevoked ? 'The issuer has withdrawn this certificate. It should not be treated as a valid credential.' : 'The issuer has flagged this certificate for review. Treat it as unconfirmed until the dispute is resolved.'}
              {cert.statusReason && <> Reason: <em>{cert.statusReason}</em></>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/app-icon-128.png" alt="CertiTask" width={48} height={48} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#07203b', letterSpacing: -0.5 }}>Certi<span style={{ color: '#D4A017' }}>Task</span></div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Verified project certificate</div>
            </div>
          </div>
          <div style={{ background: isValid ? 'rgba(56,161,105,0.1)' : isRevoked ? 'rgba(185,28,28,0.1)' : 'rgba(180,83,9,0.12)', color: isValid ? '#276749' : isRevoked ? '#991B1B' : '#92400E', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{isValid ? '✓' : '!'}</span> {isValid ? 'Verified' : isRevoked ? 'Revoked' : 'Disputed'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Certificate of Completion</div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 15 }}>This certifies that</p>
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#07203b', letterSpacing: -0.5 }}>{cert.recipientName}</div>
            <div style={{ width: 140, height: 3, background: borderColor, margin: '12px auto' }} />
          </div>
          <p style={{ color: '#4B5563', fontSize: 14, maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>successfully completed the project</p>
          <h1 style={{ fontSize: 26, margin: '10px 0', color: '#07203b', fontWeight: 800 }}>{cert.title}</h1>
          <p style={{ color: '#4B5563', fontSize: 14, margin: 0 }}>
            for <Link href={`/clients/${cert.client.id}`} style={{ fontSize: 18, fontWeight: 700, color: '#07203b', textDecoration: 'none' }}>{cert.issuerName}</Link>
            <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>Verified {CLIENT_TYPE_LABEL[cert.issuerType]}</span>
          </p>

          {cert.skills.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Skills demonstrated</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {cert.skills.map(s => <span key={s} style={{ fontSize: 11, fontWeight: 600, color: '#07203b', background: 'rgba(7,32,59,0.06)', border: '1px solid rgba(7,32,59,0.12)', borderRadius: 6, padding: '3px 10px' }}>{s}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 44, padding: '0 20px', borderTop: '1px solid #F3F4F6', paddingTop: 28, gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Issued</div>
              <div style={{ fontWeight: 700, color: '#07203b', fontSize: 15, marginTop: 4 }}>{fmt(cert.issuedAt)}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>ID: <span style={{ fontFamily: 'monospace', color: '#111827', fontWeight: 600 }}>{cert.certId}</span></div>
              <Link href={`/verify?id=${encodeURIComponent(cert.certId)}`} style={{ fontSize: 11, color: '#07203b', fontWeight: 700, display: 'inline-block', marginTop: 6 }}>Verify this certificate →</Link>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: 58, width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image src="/signature.png" alt="Authorized signatory signature" width={180} height={97} style={{ width: 180, height: 97, objectFit: 'contain' }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#07203b' }}>Authorized Signatory</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>CertiTask Verification Authority</div>
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <PrintButton />
            {canDownload && (
              <a href={`/api/certificates/${cert.id}/pdf`} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#07203b", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 8px rgba(7,32,59,0.15)" }}>
                📥 Download PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

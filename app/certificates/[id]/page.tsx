import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { PrintButton } from '@/components/PrintButton';

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let cert = null;
  try {
    cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id },
          { certId: id }
        ]
      },
      include: { company: true },
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
  }

  if (!cert) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f9fc", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ color: "#07203b", margin: "0 0 10px" }}>Certificate Not Found</h2>
          <p style={{ color: "#6b7280", margin: 0 }}>The requested credential could not be located or may have been revoked.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f9fc', padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '860px', background: '#fff', borderRadius: 12, padding: '48px 40px', boxShadow: '0 12px 40px rgba(7,32,59,0.09)', border: '2px solid #D4A017', position: 'relative' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/app-icon-128.png" alt="CertiTask" width={48} height={48} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#07203b', letterSpacing: -0.5 }}>
                Certi<span style={{ color: '#D4A017' }}>Task</span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Verified Corporate Credential</div>
            </div>
          </div>
          <div style={{ background: 'rgba(56,161,105,0.1)', color: '#276749', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✓</span> Official Verification
          </div>
        </div>

        {/* Certificate Body */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Certificate of Completion</div>
          <h1 style={{ fontSize: 32, margin: 0, color: '#07203b', fontWeight: 800 }}>{cert.title}</h1>
          <p style={{ marginTop: 12, color: '#6b7280', fontSize: 15 }}>This official credential certifies that</p>

          <div style={{ marginTop: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#07203b', letterSpacing: -0.5 }}>{cert.studentName}</div>
            <div style={{ width: 140, height: 3, background: '#D4A017', margin: '12px auto' }} />
            <div style={{ marginTop: 12, color: '#4B5563', fontSize: 14, maxWidth: 580, margin: '12px auto 0', lineHeight: 1.6 }}>
              has successfully completed all project milestones and met the verified criteria established by
            </div>
            <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700, color: '#07203b' }}>
              {cert.company?.name || 'CertiTask Corporate Partner'}
            </div>
          </div>

          {/* Footer details (Issue Date & Signature - Valid Till Removed) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 44, padding: '0 20px', borderTop: '1px solid #F3F4F6', paddingTop: 28 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Issue Date</div>
              <div style={{ fontWeight: 700, color: '#07203b', fontSize: 15, marginTop: 4 }}>{cert.issueDate}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
                ID: <span style={{ fontFamily: 'monospace', color: '#111827', fontWeight: 600 }}>{cert.certId}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ height: 58, width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image src="/signature.png" alt="Authorized signatory signature" width={180} height={97} style={{ width: 180, height: 97, objectFit: 'contain' }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#07203b' }}>Authorized Signatory</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>CertiTask Verification Authority</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12 }}>
            <PrintButton />
            <a
              href={`/api/certificates/${cert.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "#07203b",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(7,32,59,0.15)"
              }}
            >
              📥 Download Official PDF
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

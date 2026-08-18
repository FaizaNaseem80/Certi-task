import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!cert) {
    return <div style={{ padding: 40 }}>Certificate not found.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f9fc', padding: 40 }}>
      <div style={{ width: '900px', background: '#fff', borderRadius: 8, padding: 36, boxShadow: '0 8px 30px rgba(8,21,45,0.08)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/app-icon-128.png" alt="CertiTask" width={56} height={56} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#07203b' }}>
              Certi<span style={{ color: '#D4A017' }}>Task</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Verified Project Credential</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <h1 style={{ fontSize: 34, margin: 0, color: '#07203b' }}>{cert.title}</h1>
          <p style={{ marginTop: 8, color: '#6b7280' }}>This certificate verifies that</p>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{cert.studentName}</div>
            <div style={{ marginTop: 8, color: '#6b7280' }}>has successfully completed the project and met the verified criteria set by</div>
            <div style={{ marginTop: 8, fontWeight: 700, color: '#07203b' }}>{cert.company?.name || 'Company'}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, padding: '0 40px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Issue Date</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>{cert.issueDate}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Expiry Date</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>{cert.expiryDate}</div>
            </div>
          </div>

          <div style={{ marginTop: 28, borderTop: '1px dashed #E5E7EB', paddingTop: 18, fontSize: 12, color: '#6b7280' }}>
            Certificate ID: <span style={{ fontFamily: 'monospace', color: '#111827' }}>{cert.certId}</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={() => window.print()} style={{ background: '#D4A017', border: 'none', padding: '10px 14px', borderRadius: 8, color: '#07203b', fontWeight: 800, cursor: 'pointer' }}>Print / Save</button>
          </div>
        </div>

      </div>
    </div>
  );
}

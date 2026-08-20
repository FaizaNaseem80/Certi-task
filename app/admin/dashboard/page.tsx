"use client";

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      setOverview(data.counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 28, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Super Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginTop: 6 }}>Platform overview and global controls (FR-A1..FR-A15 subset)</p>

      {loading ? (
        <div style={{ marginTop: 20 }}>Loading overview…</div>
      ) : (
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Companies</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#07203b' }}>{overview?.companies ?? 0}</div>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Students</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#07203b' }}>{overview?.students ?? 0}</div>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Projects</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#07203b' }}>{overview?.projects ?? 0}</div>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Submissions (last 7d)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#07203b' }}>{overview?.submissionsThisWeek ?? 0}</div>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Certificates Issued</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#07203b' }}>{overview?.certificatesIssued ?? 0}</div>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 4px 12px rgba(2,6,23,0.04)' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Certificates Revoked</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#07203b' }}>{overview?.certificatesRevoked ?? 0}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <p style={{ color: '#6b7280' }}>Admin controls such as company verification, suspension, certificate oversight, dispute center, and export will be added here. This page provides the super-admin overview required by FR-A3 and the controls entry points for FR-A1..FR-A15.</p>
      </div>
    </div>
  );
}

import React from 'react';

export const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
    {children}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ background: accent ? 'rgba(123,97,255,0.12)' : 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 7 }}>
        <Icon size={16} color={accent ? 'var(--accent-2)' : 'var(--text-3)'} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'Syne,sans-serif', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{label}</span>
    </div>
    <div style={{ fontSize: 20, fontFamily: 'Syne,sans-serif', fontWeight: 700, color: accent ? 'var(--accent-2)' : 'var(--text)' }}>{value}</div>
  </div>
);

export const Topbar = ({ left, right }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {left}
      {right}
    </div>
  </div>
);

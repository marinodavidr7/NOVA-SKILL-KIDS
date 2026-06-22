'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        padding: '8px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseOver={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
      onMouseOut={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Guardar como PDF
    </button>
  );
}

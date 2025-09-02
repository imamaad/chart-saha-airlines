import React from 'react';

export function SideMenu({ open, onClose, onLogout, user }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 40
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '280px',
          background: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          padding: '16px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontWeight: 700, color: '#111827' }}>منو</div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px'
          }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {user && (
          <div style={{ padding: '12px 16px', color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
            وارد شده به نام: <strong>{user.username}</strong>
          </div>
        )}

        <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={onLogout}
            style={{
              textAlign: 'right',
              width: '100%',
              padding: '10px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            خروج
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 16px', color: '#9ca3af', fontSize: '12px' }}>
          © 2024 ساها
        </div>
      </div>
    </>
  );
}



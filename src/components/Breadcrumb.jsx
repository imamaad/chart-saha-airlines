import React from 'react';

export const Breadcrumb = ({ path, onItemClick }) => {
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px',
      padding: '16px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280'
      }}>
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>مسیر:</span>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {path.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <svg style={{ width: '16px', height: '16px', color: '#9ca3af', margin: '0 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <button
              onClick={() => onItemClick(item)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: index === path.length - 1 ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                background: 'transparent',
                color: index === path.length - 1 ? '#3b82f6' : '#6b7280',
                backgroundColor: index === path.length - 1 ? '#eff6ff' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (index !== path.length - 1) {
                  e.target.style.color = '#3b82f6';
                  e.target.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== path.length - 1) {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {index === 0 && (
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                <span style={{ 
                  maxWidth: '128px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              </div>
            </button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Current level indicator */}
      <div style={{
        marginRight: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        <span>سطح:</span>
        <span style={{ fontWeight: 600, color: '#3b82f6' }}>{path.length}</span>
      </div>
    </nav>
  );
};

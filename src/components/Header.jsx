import React from 'react';

export const Header = ({ title, viewMode, onToggleView, data }) => {
  // محاسبه آمار کلی
  const getTotalStats = () => {
    if (!data || !data.counts) return { official: 0, contract: 0, retired: 0, partTime: 0, total: 0 };
    
    const counts = data.counts;
    const total = (counts.official || 0) + (counts.contract || 0) + (counts.retired || 0) + (counts.partTime || 0);
    
    return {
      official: counts.official || 0,
      contract: counts.contract || 0,
      retired: counts.retired || 0,
      partTime: counts.partTime || 0,
      total
    };
  };

  const stats = getTotalStats();

  return (
    <div style={{
      background: 'linear-gradient(to right, #3b82f6, #1d4ed8, #1e40af)',
      color: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}>
              {title || 'چارت سازمانی'}
            </h1>
            <p style={{
              color: '#bfdbfe',
              fontSize: '14px',
              margin: '0 0 8px 0'
            }}>
              شرکت هواپیمایی ساها
            </p>
            
            {/* نمایش آمار کلی */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginTop: '12px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.total}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>کل</div>
              </div>
              
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.official}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>رسمی</div>
              </div>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.contract}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>قراردادی</div>
              </div>
              
              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.retired}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>بازنشسته</div>
              </div>
              
              <div style={{
                background: 'rgba(139, 92, 246, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.partTime}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>پاره‌وقت</div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onToggleView}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {viewMode === 'chart' ? (
              <>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>نمایش لیست</span>
              </>
            ) : (
              <>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>نمایش چارت</span>
              </>
            )}
          </div>
        </button>
      </div>
      
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '128px',
        height: '128px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        transform: 'translate(-64px, -64px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '96px',
        height: '96px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        transform: 'translate(48px, 48px)'
      }}></div>
    </div>
  );
};
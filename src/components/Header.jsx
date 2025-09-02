import React, { useEffect, useMemo, useState } from 'react';

export const Header = ({ title, viewMode, onToggleView, data, onOpenMenu }) => {
  // وضعیت آمار برای هدر از انتخاب/هاور
  const [headerStats, setHeaderStats] = useState({
    capacity: 0,
    totalPersonnel: 0,
    employee: 0,
    contractor: 0,
    military: 0,
    retired: 0,
    retiredMilitary: 0,
    label: title || 'چارت سازمانی',
  });

  // گوش دادن به رویدادهای چارت
  useEffect(() => {
    const onSelected = (e) => {
      if (!e?.detail) return;
      const { node, stats } = e.detail;
      setHeaderStats({ ...stats, label: node?.label || (title || 'چارت سازمانی') });
    };
    const onHover = (e) => {
      if (!e?.detail) return;
      const { node, stats } = e.detail;
      setHeaderStats({ ...stats, label: node?.label || (title || 'چارت سازمانی') });
    };
    window.addEventListener('chart:selectedStats', onSelected);
    window.addEventListener('chart:hoverStats', onHover);
    return () => {
      window.removeEventListener('chart:selectedStats', onSelected);
      window.removeEventListener('chart:hoverStats', onHover);
    };
  }, [title]);

  // اگر هنوز رویدادی نیامده، از داده‌ی اولیه برای نمایش پایه‌ای استفاده کن
  const initialStats = useMemo(() => {
    if (!data) return headerStats;
    return headerStats;
  }, [data, headerStats]);

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
          <button
            onClick={onOpenMenu}
            title="منو"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
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
              {initialStats.label}
            </h1>
            <p style={{
              color: '#bfdbfe',
              fontSize: '14px',
              margin: '0 0 8px 0'
            }}>
              شرکت هواپیمایی ساها
            </p>
            
            {/* نمایش آمار کلی انتخاب/هاور */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
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
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.capacity}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>ظرفیت</div>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.totalPersonnel}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>کل پرسنل</div>
              </div>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.employee}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>کارمند</div>
              </div>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.contractor}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>قرار دادی</div>
              </div>
              
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.military}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>نظامی</div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.retired}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>بازنشسته</div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{initialStats.retiredMilitary}</div>
                <div style={{ fontSize: '10px', opacity: '0.9' }}>بازنشسته - نظامی</div>
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
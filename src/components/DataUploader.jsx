import React, { useState } from 'react';

export const DataUploader = ({ onDataUpload, onClose }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('لطفاً فقط فایل JSON انتخاب کنید');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('لطفاً یک فایل انتخاب کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // بررسی ساختار داده
      if (!jsonData.organization) {
        throw new Error('ساختار فایل نامعتبر است. فایل باید شامل فیلد "organization" باشد.');
      }

      // اعتبارسنجی داده‌ها
      validateData(jsonData.organization);
      
      onDataUpload(jsonData.organization);
      onClose();
    } catch (err) {
      setError(`خطا در خواندن فایل: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateData = (node) => {
    if (!node.label) {
      throw new Error('هر گره باید دارای فیلد "label" باشد');
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => validateData(child));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/json' || droppedFile.name.endsWith('.json')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('لطفاً فقط فایل JSON انتخاب کنید');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            آپلود فایل داده جدید
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            بستن
          </button>
        </div>

        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          marginBottom: '24px',
          backgroundColor: '#f9fafb',
          transition: 'all 0.3s ease'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        >
          <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <p style={{ fontSize: '16px', color: '#374151', marginBottom: '8px' }}>
            فایل JSON خود را اینجا رها کنید
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            یا روی دکمه زیر کلیک کنید
          </p>
          
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            انتخاب فایل
          </label>
        </div>

        {file && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '20px', height: '20px', color: '#0ea5e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontWeight: '600', color: '#0ea5e9' }}>
                فایل انتخاب شده:
              </span>
              <span style={{ color: '#0369a1' }}>{file.name}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#0369a1', marginTop: '4px' }}>
              اندازه: {(file.size / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: '#dc2626', fontWeight: '500' }}>{error}</span>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            انصراف
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: file && !isLoading ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: file && !isLoading ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              opacity: file && !isLoading ? 1 : 0.6
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                در حال آپلود...
              </div>
            ) : (
              'آپلود و اعمال'
            )}
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            نکات مهم:
          </h4>
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: '1.6' }}>
            <li>فایل باید در فرمت JSON باشد</li>
            <li>ساختار باید شامل فیلد "organization" باشد</li>
            <li>هر گره باید دارای فیلد "label" باشد</li>
            <li>فیلدهای اختیاری: "name"، "employmentType"، "children"</li>
            <li>پس از آپلود، داده‌های فعلی جایگزین می‌شوند</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

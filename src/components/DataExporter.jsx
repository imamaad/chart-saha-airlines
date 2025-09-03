import React, { useState } from 'react';

export const DataExporter = ({ data, onClose }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = () => {
    const exportData = {
      organization: data,
      exportInfo: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        totalNodes: countNodes(data),
        totalLevels: getMaxLevel(data)
      }
    };

    if (includeStats) {
      exportData.statistics = calculateExportStats(data);
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    downloadFile(jsonString, 'saha-organization-data.json', 'application/json');
  };

  const exportToCSV = () => {
    const csvData = convertToCSV(data);
    downloadFile(csvData, 'saha-organization-data.csv', 'text/csv');
  };

  const exportToExcel = () => {
    // برای Excel از فرمت CSV استفاده می‌کنیم که Excel می‌تواند باز کند
    const csvData = convertToCSV(data);
    downloadFile(csvData, 'saha-organization-data.xlsx', 'text/csv');
  };

  const exportToText = () => {
    const textData = convertToText(data);
    downloadFile(textData, 'saha-organization-data.txt', 'text/plain');
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (exportFormat) {
        case 'json':
          exportToJSON();
          break;
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'text':
          exportToText();
          break;
        default:
          exportToJSON();
      }
      
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('خطا در export:', error);
      setIsExporting(false);
    }
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const countNodes = (node) => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => count += countNodes(child));
    }
    return count;
  };

  const getMaxLevel = (node, level = 0) => {
    let maxLevel = level;
    if (node.children) {
      node.children.forEach(child => {
        maxLevel = Math.max(maxLevel, getMaxLevel(child, level + 1));
      });
    }
    return maxLevel;
  };

  const calculateExportStats = (node) => {
    const stats = {
      totalNodes: 0,
      totalPersonnel: 0,
      employmentTypes: {},
      levels: {}
    };

    const traverse = (node, level = 0) => {
      stats.totalNodes++;
      
      if (!stats.levels[level]) {
        stats.levels[level] = 0;
      }
      stats.levels[level]++;

      if (node.name) {
        stats.totalPersonnel++;
      }

      if (node.employmentType) {
        if (!stats.employmentTypes[node.employmentType]) {
          stats.employmentTypes[node.employmentType] = 0;
        }
        stats.employmentTypes[node.employmentType]++;
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(node);
    return stats;
  };

  const convertToCSV = (node) => {
    const rows = [];
    rows.push('سطح,عنوان,نام پرسنل,نوع استخدام,آی‌دی,تعداد فرزندان');
    
    const traverse = (node, level = 0) => {
      const row = [
        level + 1,
        `"${node.label || ''}"`,
        `"${node.name || ''}"`,
        `"${node.employmentType || ''}"`,
        node.id || '',
        node.children ? node.children.length : 0
      ];
      rows.push(row.join(','));
      
      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(node);
    return rows.join('\n');
  };

  const convertToText = (node) => {
    let text = 'ساختار سازمانی شرکت هواپیمایی ساها\n';
    text += '='.repeat(50) + '\n\n';
    
    const traverse = (node, level = 0) => {
      const indent = '  '.repeat(level);
      text += `${indent}${level + 1}. ${node.label}\n`;
      
      if (node.name) {
        text += `${indent}   نام: ${node.name}\n`;
      }
      
      if (node.employmentType) {
        text += `${indent}   نوع استخدام: ${node.employmentType}\n`;
      }
      
      if (node.children && node.children.length > 0) {
        text += `${indent}   تعداد زیرمجموعه: ${node.children.length}\n`;
      }
      
      text += '\n';
      
      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(node);
    return text;
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
            خروجی داده‌ها
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            فرمت خروجی
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="json">JSON (پیشنهادی)</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel (CSV)</option>
            <option value="text">متن ساده</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeStats}
              onChange={(e) => setIncludeStats(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px' }}>
              شامل آمار و اطلاعات اضافی (فقط برای JSON)
            </span>
          </label>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
            اطلاعات خروجی:
          </h4>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
            <div>• تعداد کل گره‌ها: {countNodes(data)}</div>
            <div>• تعداد سطوح: {getMaxLevel(data) + 1}</div>
            <div>• فرمت انتخاب شده: {exportFormat.toUpperCase()}</div>
            {exportFormat === 'json' && (
              <div>• شامل آمار: {includeStats ? 'بله' : 'خیر'}</div>
            )}
          </div>
        </div>

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
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '12px 24px',
              backgroundColor: isExporting ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: isExporting ? 0.6 : 1
            }}
          >
            {isExporting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                در حال export...
              </div>
            ) : (
              'دانلود فایل'
            )}
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0369a1'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            نکات مهم:
          </h4>
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: '1.6' }}>
            <li>فایل JSON شامل تمام اطلاعات و ساختار کامل است</li>
            <li>فایل CSV برای تحلیل در Excel مناسب است</li>
            <li>فایل متن برای چاپ و مستندسازی استفاده می‌شود</li>
            <li>پس از دانلود، فایل در پوشه Downloads ذخیره می‌شود</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

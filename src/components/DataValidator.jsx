import React, { useState, useEffect } from 'react';

export const DataValidator = ({ data, onClose }) => {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (data) {
      validateData();
    }
  }, [data]);

  const validateData = () => {
    setIsValidating(true);
    
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {},
      timestamp: new Date().toISOString()
    };

    try {
      // بررسی ساختار اصلی
      if (!data) {
        results.errors.push('داده‌ای برای اعتبارسنجی وجود ندارد');
        results.isValid = false;
        return;
      }

      if (!data.label) {
        results.errors.push('گره ریشه باید دارای فیلد "label" باشد');
        results.isValid = false;
      }

      // بررسی ساختار درختی
      const treeValidation = validateTreeStructure(data, 0, []);
      results.errors.push(...treeValidation.errors);
      results.warnings.push(...treeValidation.warnings);

      // محاسبه آمار
      results.stats = calculateValidationStats(data);

      // بررسی یکپارچگی
      const integrityCheck = checkDataIntegrity(data);
      results.errors.push(...integrityCheck.errors);
      results.warnings.push(...integrityCheck.warnings);

      // بررسی نهایی
      if (results.errors.length > 0) {
        results.isValid = false;
      }

    } catch (error) {
      results.errors.push(`خطا در اعتبارسنجی: ${error.message}`);
      results.isValid = false;
    } finally {
      setIsValidating(false);
      setValidationResults(results);
    }
  };

  const validateTreeStructure = (node, level, path) => {
    const result = { errors: [], warnings: [] };
    const currentPath = [...path, node.label || 'نامشخص'];

    // بررسی فیلدهای اجباری
    if (!node.label || node.label.trim() === '') {
      result.errors.push(`گره در مسیر ${currentPath.join(' > ')} فیلد "label" ندارد`);
    }

    // بررسی ID
    if (!node.id) {
      result.warnings.push(`گره "${node.label}" در مسیر ${currentPath.join(' > ')} فیلد "id" ندارد`);
    }

    // بررسی طول عنوان
    if (node.label && node.label.length > 100) {
      result.warnings.push(`عنوان گره "${node.label}" خیلی طولانی است (${node.label.length} کاراکتر)`);
    }

    // بررسی نوع استخدام
    if (node.employmentType) {
      const validTypes = ['نظامی', 'کارمند', 'قراردادی', 'بازنشسته', 'بازنشسته - نظامی'];
      if (!validTypes.includes(node.employmentType)) {
        result.warnings.push(`نوع استخدام "${node.employmentType}" در گره "${node.label}" غیراستاندارد است`);
      }
    }

    // بررسی عمق درخت
    if (level > 10) {
      result.warnings.push(`عمق درخت در گره "${node.label}" خیلی زیاد است (سطح ${level + 1})`);
    }

    // بررسی فرزندان
    if (node.children) {
      if (!Array.isArray(node.children)) {
        result.errors.push(`فیلد "children" در گره "${node.label}" باید آرایه باشد`);
      } else {
        // بررسی تعداد فرزندان
        if (node.children.length > 50) {
          result.warnings.push(`گره "${node.label}" تعداد زیادی فرزند دارد (${node.children.length})`);
        }

        // بررسی فرزندان تکراری
        const childLabels = node.children.map(child => child.label).filter(Boolean);
        const uniqueLabels = new Set(childLabels);
        if (childLabels.length !== uniqueLabels.size) {
          result.warnings.push(`گره "${node.label}" دارای فرزندان با عنوان تکراری است`);
        }

        // اعتبارسنجی فرزندان
        node.children.forEach((child, index) => {
          const childValidation = validateTreeStructure(child, level + 1, currentPath);
          result.errors.push(...childValidation.errors);
          result.warnings.push(...childValidation.warnings);
        });
      }
    }

    return result;
  };

  const checkDataIntegrity = (node) => {
    const result = { errors: [], warnings: [] };

    // بررسی حلقه‌های مرجع
    const visited = new Set();
    const checkCycles = (currentNode, path = []) => {
      if (visited.has(currentNode)) {
        result.errors.push(`حلقه مرجع در مسیر ${path.join(' > ')}`);
        return;
      }
      
      visited.add(currentNode);
      path.push(currentNode.label || 'نامشخص');
      
      if (currentNode.children) {
        currentNode.children.forEach(child => {
          checkCycles(child, [...path]);
        });
      }
    };

    checkCycles(node);

    // بررسی آمار
    if (node.counts) {
      const counts = node.counts;
      const total = (counts.official || 0) + (counts.contract || 0) + (counts.retired || 0) + (counts.partTime || 0);
      
      if (total > 0 && node.children && node.children.length === 0) {
        result.warnings.push(`گره "${node.label}" دارای آمار پرسنل است اما فرزندی ندارد`);
      }
    }

    return result;
  };

  const calculateValidationStats = (node) => {
    const stats = {
      totalNodes: 0,
      totalLevels: 0,
      nodesWithName: 0,
      nodesWithEmploymentType: 0,
      nodesWithChildren: 0,
      maxChildrenCount: 0,
      averageChildrenCount: 0,
      totalChildrenCount: 0
    };

    const traverse = (currentNode, level = 0) => {
      stats.totalNodes++;
      stats.totalLevels = Math.max(stats.totalLevels, level + 1);

      if (currentNode.name) stats.nodesWithName++;
      if (currentNode.employmentType) stats.nodesWithEmploymentType++;
      
      if (currentNode.children && currentNode.children.length > 0) {
        stats.nodesWithChildren++;
        stats.totalChildrenCount += currentNode.children.length;
        stats.maxChildrenCount = Math.max(stats.maxChildrenCount, currentNode.children.length);
        
        currentNode.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(node);
    
    if (stats.nodesWithChildren > 0) {
      stats.averageChildrenCount = (stats.totalChildrenCount / stats.nodesWithChildren).toFixed(2);
    }

    return stats;
  };

  const getSeverityColor = (type) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg style={{ width: '16px', height: '16px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg style={{ width: '16px', height: '16px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg style={{ width: '16px', height: '16px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (!data) {
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
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white' }}>در حال بارگذاری...</div>
      </div>
    );
  }

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
        maxWidth: '800px',
        maxHeight: '90vh',
        width: '100%',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            اعتبارسنجی داده‌ها
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

        {isValidating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '4px solid #dbeafe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginLeft: '12px'
            }}></div>
            در حال اعتبارسنجی...
          </div>
        )}

        {validationResults && (
          <>
            {/* خلاصه وضعیت */}
            <div style={{
              backgroundColor: validationResults.isValid ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${validationResults.isValid ? '#22c55e' : '#ef4444'}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                {validationResults.isValid ? '✅' : '❌'}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: validationResults.isValid ? '#166534' : '#dc2626',
                marginBottom: '8px'
              }}>
                {validationResults.isValid ? 'داده‌ها معتبر هستند' : 'مشکلاتی در داده‌ها یافت شد'}
              </h3>
              <p style={{
                color: validationResults.isValid ? '#166534' : '#dc2626',
                fontSize: '14px'
              }}>
                {validationResults.errors.length} خطا • {validationResults.warnings.length} هشدار
              </p>
            </div>

            {/* آمار کلی */}
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                آمار کلی
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                    {validationResults.stats.totalNodes}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>کل گره‌ها</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    {validationResults.stats.totalLevels}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>تعداد سطوح</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {validationResults.stats.nodesWithName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>دارای نام</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                    {validationResults.stats.maxChildrenCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>بیشترین فرزند</div>
                </div>
              </div>
            </div>

            {/* خطاها */}
            {validationResults.errors.length > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>
                  خطاها ({validationResults.errors.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {validationResults.errors.map((error, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #fecaca'
                    }}>
                      {getSeverityIcon('error')}
                      <span style={{ fontSize: '14px', color: '#374151' }}>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* هشدارها */}
            {validationResults.warnings.length > 0 && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#d97706' }}>
                  هشدارها ({validationResults.warnings.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {validationResults.warnings.map((warning, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa'
                    }}>
                      {getSeverityIcon('warning')}
                      <span style={{ fontSize: '14px', color: '#374151' }}>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* اطلاعات اضافی */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#0369a1' }}>
                اطلاعات اعتبارسنجی
              </h4>
              <div style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.6' }}>
                <div>• زمان اعتبارسنجی: {new Date(validationResults.timestamp).toLocaleString('fa-IR')}</div>
                <div>• وضعیت کلی: {validationResults.isValid ? 'معتبر' : 'نامعتبر'}</div>
                <div>• تعداد خطاها: {validationResults.errors.length}</div>
                <div>• تعداد هشدارها: {validationResults.warnings.length}</div>
              </div>
            </div>
          </>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={validateData}
            disabled={isValidating}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            اعتبارسنجی مجدد
          </button>
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
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

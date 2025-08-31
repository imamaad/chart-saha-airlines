import React, { useMemo, useState } from 'react';

export const ListRenderer = ({ data, onRowClick }) => {
  const [sortField, setSortField] = useState('label');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const { analysis, tableData } = useMemo(() => {
    if (!data) return { analysis: null, tableData: [] };

    const sum = {
      official: 0,
      contract: 0,
      retired: 0,
      partTime: 0,
      total: 0
    };
    
    const flags = {
      name: false,
      type: false,
      official: false,
      contract: false,
      retired: false,
      partTime: false,
      total: false
    };

    const tableData = [];

    const traverseNode = (node, depth = 0) => {
      if (node.name) flags.name = true;
      if (node.employmentType) flags.type = true;
      
      const counts = node.counts || {};
      if (counts.official != null) {
        flags.official = true;
        sum.official += counts.official || 0;
      }
      if (counts.contract != null) {
        flags.contract = true;
        sum.contract += counts.contract || 0;
      }
      if (counts.retired != null) {
        flags.retired = true;
        sum.retired += counts.retired || 0;
      }
      if (counts.partTime != null) {
        flags.partTime = true;
        sum.partTime += counts.partTime || 0;
      }
      
      const total = (counts.official || 0) + (counts.contract || 0) + 
                   (counts.retired || 0) + (counts.partTime || 0);
      if (total) {
        flags.total = true;
        sum.total += total;
      }

      tableData.push({
        ...node,
        depth,
        counts,
        total
      });

      (node.children || []).forEach(child => traverseNode(child, depth + 1));
    };

    traverseNode(data);

    return {
      analysis: { sum, flags },
      tableData
    };
  }, [data]);

  // فیلتر و مرتب‌سازی
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'total') {
        aVal = a.total || 0;
        bVal = b.total || 0;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [tableData, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!data || !analysis) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #dbeafe',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginLeft: '8px'
        }}></div>
        <span style={{ color: '#6b7280' }}>در حال بارگذاری...</span>
      </div>
    );
  }

  const { flags, sum } = analysis;

  const headers = [
    { key: 'index', label: 'ردیف', sortable: false },
    { key: 'label', label: 'عنوان', sortable: true },
    ...(flags.name ? [{ key: 'name', label: 'نام پرسنل', sortable: true }] : []),
    ...(flags.type ? [{ key: 'employmentType', label: 'نوع استخدام', sortable: true }] : []),
    ...(flags.official ? [{ key: 'official', label: 'نظامی و رسمی', sortable: true }] : []),
    ...(flags.contract ? [{ key: 'contract', label: 'قراردادی', sortable: true }] : []),
    ...(flags.retired ? [{ key: 'retired', label: 'بازنشسته', sortable: true }] : []),
    ...(flags.partTime ? [{ key: 'partTime', label: 'پاره‌وقت', sortable: true }] : []),
    ...(flags.total ? [{ key: 'total', label: 'جمع کل', sortable: true }] : [])
  ];

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* کنترل‌های جدول */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            position: 'relative',
            flex: '1',
            maxWidth: '400px',
            width: '100%'
          }}>
            <input
              type="text"
              placeholder="جستجو در عناوین و نام‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <svg style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#9ca3af'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span>تعداد نتایج:</span>
            <span style={{ fontWeight: '600', color: '#3b82f6' }}>{filteredAndSortedData.length}</span>
          </div>
        </div>
      </div>

      {/* آمار کلی */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(to right, #10b981, #059669)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{sum.official}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>نظامی و رسمی</div>
        </div>
        <div style={{
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{sum.contract}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>قراردادی</div>
        </div>
        <div style={{
          background: 'linear-gradient(to right, #f59e0b, #d97706)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{sum.retired}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>بازنشسته</div>
        </div>
        <div style={{
          background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{sum.partTime}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>پاره‌وقت</div>
        </div>
      </div>

      {/* جدول */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            fontSize: '14px',
            borderCollapse: 'collapse'
          }} dir="rtl">
            <thead style={{
              background: 'linear-gradient(to right, #f9fafb, #f3f4f6)'
            }}>
          <tr>
            {headers.map((header, index) => (
              <th 
                    key={header.key}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: header.sortable ? 'pointer' : 'default',
                      transition: 'background-color 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      if (header.sortable) {
                        e.target.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (header.sortable) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => header.sortable && handleSort(header.key)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{header.label}</span>
                      {header.sortable && (
                        <span style={{ color: '#3b82f6', fontWeight: '700' }}>
                          {getSortIcon(header.key)}
                        </span>
                      )}
                    </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
              {filteredAndSortedData.map((row, index) => (
            <tr 
              key={index}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.parentElement.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseOut={(e) => {
                    e.target.parentElement.style.backgroundColor = 'transparent';
                  }}
              onClick={() => onRowClick(row)}
            >
                  <td style={{
                    padding: '12px 16px',
                    color: '#6b7280',
                    fontWeight: '500',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    {index + 1}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        marginLeft: '8px'
                      }}></div>
                      <span style={{
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {"—".repeat(row.depth)} {row.label}
                      </span>
                    </div>
                  </td>
                  {flags.name && (
                    <td style={{
                      padding: '12px 16px',
                      color: '#6b7280',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      {row.name || "—"}
                    </td>
                  )}
                  {flags.type && (
                    <td style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#f3f4f6',
                        color: '#374151'
                      }}>
                        {row.employmentType || "—"}
                      </span>
                    </td>
                  )}
                  {flags.official && (
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#166534',
                        fontWeight: '600'
                      }}>
                        {row.counts.official || 0}
                      </span>
                    </td>
                  )}
                  {flags.contract && (
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: '600'
                      }}>
                        {row.counts.contract || 0}
                      </span>
                    </td>
                  )}
                  {flags.retired && (
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#fed7aa',
                        color: '#92400e',
                        fontWeight: '600'
                      }}>
                        {row.counts.retired || 0}
                      </span>
                    </td>
                  )}
                  {flags.partTime && (
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e9d5ff',
                        color: '#7c3aed',
                        fontWeight: '600'
                      }}>
                        {row.counts.partTime || 0}
                      </span>
                    </td>
                  )}
                  {flags.total && (
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        background: '#f3f4f6',
                        color: '#374151',
                        fontWeight: '700'
                      }}>
                        {row.total || 0}
                      </span>
                    </td>
                  )}
            </tr>
          ))}
            </tbody>
            <tfoot style={{
              background: 'linear-gradient(to right, #f9fafb, #f3f4f6)'
            }}>
              <tr>
                <td style={{
                  padding: '16px',
                  fontWeight: '700',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }} colSpan={2}>
                  مجموع کل
                </td>
                {flags.name && <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}></td>}
                {flags.type && <td style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}></td>}
                {flags.official && (
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#10b981',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {sum.official}
                    </span>
                  </td>
                )}
                {flags.contract && (
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {sum.contract}
                    </span>
                  </td>
                )}
                {flags.retired && (
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {sum.retired}
                    </span>
                  </td>
                )}
                {flags.partTime && (
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {sum.partTime}
                    </span>
                  </td>
                )}
                {flags.total && (
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      background: '#374151',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '18px'
                    }}>
                      {sum.total}
                    </span>
                  </td>
                )}
          </tr>
            </tfoot>
      </table>
        </div>
      </div>
    </div>
  );
};
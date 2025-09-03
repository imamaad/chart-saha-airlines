import React, { useState, useEffect, useMemo } from 'react';

export const DataEditor = ({ data, onDataChange, onClose }) => {
  const [editingData, setEditingData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    employmentType: '',
    parentId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDeleteFor, setConfirmDeleteFor] = useState(null);
  const [toast, setToast] = useState(null);

  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const normalizeNode = (node, parentId = '') => {
    if (!node || typeof node !== 'object') return null;
    const normalized = { ...node };
    if (!normalized.id) normalized.id = generateId();
    if (parentId) normalized.parentId = parentId;
    if (!Array.isArray(normalized.children)) normalized.children = [];
    normalized.children = normalized.children
      .filter(Boolean)
      .map((child) => normalizeNode(child, normalized.id))
      .filter(Boolean);
    return normalized;
  };

  useEffect(() => {
    if (data) {
      const cloned = JSON.parse(JSON.stringify(data));
      const normalized = normalizeNode(cloned);
      setEditingData(normalized);
      // expand root by default
      if (normalized?.id) setExpandedIds(new Set([normalized.id]));
    }
  }, [data]);

  const ensureChildrenArray = (node) => {
    if (node && !Array.isArray(node.children)) node.children = [];
  };

  const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    if (Array.isArray(node.children)) {
      for (const child of node.children.filter(Boolean)) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addChildToNode = (node, parentId, newChild) => {
    if (!node) return false;
    if (node.id === parentId) {
      ensureChildrenArray(node);
      node.children.push(newChild);
      return true;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children.filter(Boolean)) {
        if (addChildToNode(child, parentId, newChild)) return true;
      }
    }
    return false;
  };

  const updateNodeById = (node, id, updates) => {
    if (!node) return false;
    if (node.id === id) {
      Object.assign(node, updates);
      return true;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children.filter(Boolean)) {
        if (updateNodeById(child, id, updates)) return true;
      }
    }
    return false;
  };

  const deleteNodeById = (parent, node, id) => {
    if (!node) return false;
    if (node.id === id) {
      if (!parent) return false; // prevent deleting root
      parent.children = (parent.children || []).filter((c) => c && c.id !== id);
      return true;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children.filter(Boolean)) {
        if (deleteNodeById(node, child, id)) return true;
      }
    }
    return false;
  };

  // Search utilities
  const matchesSearch = (node, q) => {
    if (!q) return true;
    const t = q.trim().toLowerCase();
    return (
      (node.label || '').toLowerCase().includes(t) ||
      (node.name || '').toLowerCase().includes(t) ||
      (node.employmentType || '').toLowerCase().includes(t)
    );
  };

  const anyDescendantMatches = (node, q) => {
    if (!q) return true;
    if (matchesSearch(node, q)) return true;
    if (!Array.isArray(node.children)) return false;
    return node.children.some((c) => anyDescendantMatches(c, q));
  };

  // Expand/Collapse
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const expandAll = () => {
    const ids = new Set();
    const collect = (n) => {
      if (!n) return;
      ids.add(n.id);
      (n.children || []).forEach(collect);
    };
    collect(editingData);
    setExpandedIds(ids);
  };
  const collapseAll = () => {
    if (editingData?.id) setExpandedIds(new Set([editingData.id]));
  };

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2200);
  };

  const saveToFile = async (dataToSave) => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const fd = new FormData();
      const jsonBlob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      fd.append('data', jsonBlob, 'data.json');

      const response = await fetch('/api/save-data', {
        method: 'POST',
        body: fd
      });

      if (response.ok) {
        setSaveStatus({ type: 'success', message: '✅ تغییرات با موفقیت در فایل ذخیره شد!' });
        onDataChange(dataToSave);
        showToast('success', 'ذخیره شد');
      } else {
        throw new Error('خطا در ذخیره فایل');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus({ type: 'error', message: '❌ خطا در ذخیره فایل. لطفاً دوباره تلاش کنید.' });
      showToast('error', 'ذخیره ناموفق بود');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyChanges = () => {
    if (editingData) {
      saveToFile(editingData);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      showToast('error', 'عنوان الزامی است');
      return;
    }

    const cloned = JSON.parse(JSON.stringify(editingData));

    if (showAddForm) {
      const parentId = selectedNode?.id || cloned?.id;
      const newNode = {
        id: generateId(),
        label: formData.label.trim(),
        name: formData.name?.trim() || undefined,
        employmentType: formData.employmentType?.trim() || undefined,
        parentId,
        children: []
      };
      ensureChildrenArray(cloned);
      if (parentId === cloned?.id) {
        cloned.children.push(newNode);
      } else {
        addChildToNode(cloned, parentId, newNode);
      }
      setEditingData(cloned);
      setSelectedNode(newNode);
      setShowAddForm(false);
      showToast('success', 'آیتم اضافه شد');
    } else if (showEditForm && selectedNode) {
      updateNodeById(cloned, selectedNode.id, {
        label: formData.label.trim(),
        name: formData.name?.trim() || undefined,
        employmentType: formData.employmentType?.trim() || undefined
      });
      const updatedSelected = findNodeById(cloned, selectedNode.id);
      setEditingData(cloned);
      setSelectedNode(updatedSelected || null);
      setShowEditForm(false);
      showToast('success', 'آیتم به‌روزرسانی شد');
    }
  };

  const filteredTree = useMemo(() => {
    if (!editingData) return null;
    if (!searchQuery.trim()) return editingData;

    const filterRec = (node) => {
      if (!node) return null;
      const keep = matchesSearch(node, searchQuery) || anyDescendantMatches(node, searchQuery);
      if (!keep) return null;
      return {
        ...node,
        children: (node.children || [])
          .map(filterRec)
          .filter(Boolean)
      };
    };
    return filterRec(editingData);
  }, [editingData, searchQuery]);

  // Tree Node
  const renderNode = (node, level = 0) => {
    if (!node) return null;
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = Array.isArray(node.children) && node.children.filter(Boolean).length > 0;
    const highlight = (text) => {
      if (!searchQuery) return text;
      const t = String(text || '');
      const q = searchQuery.trim();
      const idx = t.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return t;
      return (
        <span>
          {t.slice(0, idx)}
          <span style={{ background: '#fde68a', padding: '0 2px', borderRadius: 4 }}>{t.slice(idx, idx + q.length)}</span>
          {t.slice(idx + q.length)}
        </span>
      );
    };

    return (
      <div style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 8, background: selectedNode?.id === node.id ? '#eff6ff' : '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasChildren && (
              <button onClick={() => toggleExpand(node.id)} aria-label="toggle" style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e2e8f0', background: '#000', cursor: 'pointer' }}>
                {isExpanded ? '−' : '+'}
              </button>
            )}
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{highlight(node.label || 'بدون عنوان')}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{highlight(node.name || '')} {node.employmentType ? <>• {highlight(node.employmentType)}</> : null}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 10, background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: 999 }}>سطح {level}</span>
                {hasChildren ? <span style={{ fontSize: 10, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: 999, marginInlineStart: 6 }}>{(node.children || []).length} زیرمجموعه</span> : null}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setSelectedNode(node);
                setShowEditForm(true);
                setShowAddForm(false);
                setFormData({ label: node.label || '', name: node.name || '', employmentType: node.employmentType || '', parentId: node.parentId || '' });
              }}
              style={{ padding: '6px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >ویرایش</button>
            <button
              onClick={() => {
                setSelectedNode(node);
                setShowAddForm(true);
                setShowEditForm(false);
                setFormData({ label: '', name: '', employmentType: '', parentId: node.id || '' });
              }}
              style={{ padding: '6px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >افزودن</button>
            {node !== editingData && (
              <button
                onClick={() => setConfirmDeleteFor(node)}
                style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >حذف</button>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginTop: 8, paddingInlineStart: 12, borderInlineStart: '2px dashed #e2e8f0' }}>
            {node.children.filter(Boolean).map((child) => (
              <div key={child.id}>
                {renderNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!editingData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 360 }}>در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? '#16a34a' : '#ef4444', color: '#fff', padding: '10px 16px', borderRadius: 12, fontWeight: 700, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 1100 }}>
          {toast.message}
        </div>
      )}

      <div style={{ backgroundColor: '#f8fafc', borderRadius: 24, padding: 0, maxWidth: '95vw', maxHeight: '95vh', overflow: 'hidden', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {/* Header Sticky */}
        <div style={{ position: 'sticky', top: 0, background: '#fff', padding: 16, borderBottom: '1px solid #e2e8f0', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>ویرایش داده‌ها</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو: عنوان، نام یا نوع استخدام"
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', width: 260, background: '#f8fafc' }}
            />
            <button onClick={expandAll} style={{ padding: '8px 12px', background: '#e2e8f0', border: 'none', borderRadius: 10, cursor: 'pointer' }}>باز کردن همه</button>
            <button onClick={collapseAll} style={{ padding: '8px 12px', background: '#e2e8f0', border: 'none', borderRadius: 10, cursor: 'pointer' }}>بستن همه</button>
            <button onClick={onClose} style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>بستن</button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, overflow: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', minHeight: 300 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>درخت سازمانی</div>
            <div style={{ maxHeight: 520, overflow: 'auto' }}>
              {filteredTree ? renderNode(filteredTree, 0) : <div style={{ color: '#64748b' }}>نتیجه‌ای برای جستجو یافت نشد.</div>}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', minHeight: 300 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>فرم</div>
            {(showAddForm || showEditForm) ? (
              <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#475569' }}>عنوان (الزامی)</label>
                  <input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                  {!formData.label?.trim() && <span style={{ color: '#ef4444', fontSize: 12 }}>این فیلد الزامی است</span>}
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#475569' }}>نام</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#475569' }}>نوع استخدام</label>
                  <input value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>ذخیره فرم</button>
                  <button type="button" onClick={() => { setShowAddForm(false); setShowEditForm(false); }} style={{ padding: '10px 16px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>انصراف</button>
                </div>
              </form>
            ) : (
              <div style={{ color: '#64748b' }}>یک گره را انتخاب کنید یا روی "افزودن" در درخت کلیک کنید.</div>
            )}
          </div>
        </div>

        {/* Footer Sticky */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
          <button
            onClick={() => {
              const jsonString = JSON.stringify(editingData, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'saha-organization-data.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ padding: '12px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}
          >دانلود JSON</button>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                const normalized = normalizeNode(JSON.parse(JSON.stringify(data)));
                setEditingData(normalized);
                setShowAddForm(false);
                setShowEditForm(false);
                setSelectedNode(null);
                setFormData({ label: '', name: '', employmentType: '', parentId: '' });
                setSaveStatus(null);
                showToast('success', 'بازنشانی شد');
              }}
              style={{ padding: '12px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}
            >بازنشانی</button>

            <button
              onClick={handleApplyChanges}
              disabled={isSaving}
              style={{ padding: '12px 16px', backgroundColor: isSaving ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: isSaving ? 0.8 : 1 }}
            >{isSaving ? 'در حال ذخیره...' : 'اعمال و ذخیره تغییرات'}</button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, width: 380, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>حذف آیتم</div>
            <div style={{ color: '#475569', marginBottom: 16 }}>آیا از حذف "{confirmDeleteFor.label || 'بدون عنوان'}" و تمام زیرشاخه‌ها مطمئنید؟</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmDeleteFor(null)} style={{ padding: '8px 12px', background: '#e2e8f0', border: 'none', borderRadius: 10, cursor: 'pointer' }}>انصراف</button>
              <button
                onClick={() => {
                  const cloned = JSON.parse(JSON.stringify(editingData));
                  const deleted = deleteNodeById(null, cloned, confirmDeleteFor.id);
                  if (deleted) {
                    setEditingData(cloned);
                    setSelectedNode(null);
                    setShowAddForm(false);
                    setShowEditForm(false);
                    showToast('success', 'حذف شد');
                  }
                  setConfirmDeleteFor(null);
                }}
                style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
              >حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';

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

  // Basic tree render
  const renderNode = (node) => {
    if (!node) return null;
    return (
      <div style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8, background: selectedNode?.id === node.id ? '#eff6ff' : '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{node.label || 'بدون عنوان'}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{node.name || ''} {node.employmentType ? `• ${node.employmentType}` : ''}</div>
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
            >
              ویرایش
            </button>
            <button
              onClick={() => {
                setSelectedNode(node);
                setShowAddForm(true);
                setShowEditForm(false);
                setFormData({ label: '', name: '', employmentType: '', parentId: node.id || '' });
              }}
              style={{ padding: '6px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              افزودن زیرمجموعه
            </button>
            {node !== editingData && (
              <button
                onClick={() => {
                  if (confirm('آیا از حذف این آیتم مطمئن هستید؟ زیرشاخه‌ها نیز حذف می‌شوند.')) {
                    const cloned = JSON.parse(JSON.stringify(editingData));
                    const deleted = deleteNodeById(null, cloned, node.id);
                    if (deleted) {
                      setEditingData(cloned);
                      setSelectedNode(null);
                      setShowAddForm(false);
                      setShowEditForm(false);
                    }
                  }
                }}
                style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                حذف
              </button>
            )}
          </div>
        </div>
        {Array.isArray(node.children) && node.children.filter(Boolean).length > 0 && (
          <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px dashed #e2e8f0' }}>
            {node.children.filter(Boolean).map((child) => (
              <div key={child.id || generateId()}>
                {renderNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
        setTimeout(() => { onClose(); }, 1200);
      } else {
        throw new Error('خطا در ذخیره فایل');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus({ type: 'error', message: '❌ خطا در ذخیره فایل. لطفاً دوباره تلاش کنید.' });
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
    if (!formData.label.trim()) return;

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
    }
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
      <div style={{ backgroundColor: '#f8fafc', borderRadius: 24, padding: 24, maxWidth: '95vw', maxHeight: '95vh', overflow: 'auto', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>ویرایش داده‌ها</div>
          <button onClick={onClose} style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>بستن</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>درخت سازمانی</div>
            <div style={{ maxHeight: 480, overflow: 'auto' }}>
              {renderNode(editingData)}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>فرم</div>
            {(showAddForm || showEditForm) ? (
              <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>عنوان</span>
                  <input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>نام</span>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>نوع استخدام</span>
                  <input value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>ذخیره فرم</button>
                  <button type="button" onClick={() => { setShowAddForm(false); setShowEditForm(false); }} style={{ padding: '10px 16px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>انصراف</button>
                </div>
              </form>
            ) : (
              <div style={{ color: '#64748b' }}>یک گره را از درخت انتخاب کنید یا روی "افزودن زیرمجموعه" کلیک کنید.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', position: 'relative' }}>
          {saveStatus && (
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', padding: '10px 16px', borderRadius: 12, backgroundColor: saveStatus.type === 'success' ? '#ecfdf5' : '#fef2f2', border: `2px solid ${saveStatus.type === 'success' ? '#10b981' : '#ef4444'}`, color: saveStatus.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {saveStatus.message}
            </div>
          )}

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
          >
            دانلود JSON
          </button>

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
              }}
              style={{ padding: '12px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}
            >
              بازنشانی
            </button>

            <button
              onClick={handleApplyChanges}
              disabled={isSaving}
              style={{ padding: '12px 16px', backgroundColor: isSaving ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: isSaving ? 0.8 : 1 }}
            >
              {isSaving ? 'در حال ذخیره...' : 'اعمال و ذخیره تغییرات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

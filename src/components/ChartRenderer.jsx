import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

/* --------------------------- Org Node (memo) --------------------------- */
const OrgNode = React.memo(function OrgNode({ data }) {
  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const counts = data.subtreeStats || data.counts || {};
  const total =
    (counts.military || counts.official || 0) +
    (counts.contractor || counts.contract || 0) +
    (counts.employee || 0) +
    (counts.retired || 0) +
    (counts.retiredMilitary || 0);

  const getLevelColor = (level) => {
    const colors = [
      'linear-gradient(135deg, #1e40af, #1e3a8a)', // root
      'linear-gradient(135deg, #059669, #047857)',
      'linear-gradient(135deg, #d97706, #b45309)',
      'linear-gradient(135deg, #7c3aed, #6d28d9)',
      'linear-gradient(135deg, #dc2626, #b91c1c)',
      'linear-gradient(135deg, #0891b2, #0e7490)',
      'linear-gradient(135deg, #7c2d12, #92400e)',
      'linear-gradient(135deg, #be185d, #9d174d)',
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getLevelBorder = (level) => {
    const colors = ['#1e40af', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#7c2d12', '#be185d'];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getPercentage = (value) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(0)}%`;
  };

  return (
    <div
      onMouseEnter={() => {
        setHovered(true);
        data.onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        data.onMouseLeave?.();
      }}
      onClick={data.onNodeClick}
      onDoubleClick={() => setShowDetails(!showDetails)}
      style={{
        padding: '16px',
        borderRadius: '16px',
        border: `3px solid ${getLevelBorder(data.level || 0)}`,
        boxShadow: hovered ? '0 16px 40px rgba(0, 0, 0, 0.25)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '320px', // عرض ثابت برای تمام گره‌ها
        minHeight: '280px', // حداقل ارتفاع برای یکسان بودن
        textAlign: 'center',
        position: 'relative',
        transform: hovered ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        transformOrigin: 'center',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Handle بالا */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          backgroundColor: getLevelBorder(data.level || 0),
          width: '10px',
          height: '10px',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* نشانگر سطح */}
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          right: '-12px',
          width: '32px',
          height: '32px',
          background: getLevelColor(data.level || 0),
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          border: '2px solid white',
        }}
      >
        <span style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>
          {(data.level ?? 0) + 1}
        </span>
      </div>

      {/* آیکون */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '28px',
          height: '28px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg style={{ width: '16px', height: '16px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {/* محتوای اصلی */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* عنوان */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            lineHeight: '1.3',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            wordBreak: 'break-word',
            minHeight: '44px', // ارتفاع ثابت برای عنوان
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {data.label || 'بدون عنوان'}
        </div>

        {/* نام پرسنل - همیشه نمایش داده می‌شود */}
        <div style={{ 
          fontSize: '14px', 
          color: data.name ? '#6b7280' : '#d1d5db', 
          marginBottom: '6px', 
          fontWeight: '600', 
          fontStyle: data.name ? 'italic' : 'normal',
          minHeight: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {data.name || 'نام مشخص نشده'}
        </div>

        {/* نوع استخدام - همیشه نمایش داده می‌شود */}
        <div
          style={{
            fontSize: '12px',
            color: data.employmentType ? '#9ca3af' : '#d1d5db',
            marginBottom: '12px',
            padding: '4px 10px',
            background: data.employmentType ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
            borderRadius: '10px',
            display: 'inline-block',
            fontWeight: '500',
            border: `1px solid ${data.employmentType ? '#d1d5db' : '#e5e7eb'}`,
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {data.employmentType || 'نوع مشخص نشده'}
        </div>

        {/* آمار کلی - همیشه نمایش داده می‌شود */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: total > 0 ? '#3b82f6' : '#9ca3af',
              background: total > 0 ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
              padding: '8px 12px',
              borderRadius: '10px',
              border: `2px solid ${total > 0 ? '#bfdbfe' : '#e5e7eb'}`,
              boxShadow: total > 0 ? '0 2px 6px rgba(59, 130, 246, 0.1)' : 'none',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {total > 0 ? `${total} نفر` : 'بدون کارمند'}
          </div>

          {/* نمایش جزئیات آمار */}
          {showDetails && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: 'rgba(249, 250, 251, 0.8)', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                آمار تفصیلی:
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: counts.official > 0 ? '#10b981' : '#9ca3af',
                  fontWeight: '600',
                  padding: '2px 4px',
                  backgroundColor: counts.official > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  borderRadius: '4px',
                }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: counts.official > 0 ? '#10b981' : '#9ca3af', 
                    borderRadius: '50%' 
                  }} />
                  {counts.official || 0} {counts.official > 0 ? `(${getPercentage(counts.official)}%)` : ''}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: counts.contract > 0 ? '#3b82f6' : '#9ca3af',
                  fontWeight: '600',
                  padding: '2px 4px',
                  backgroundColor: counts.contract > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  borderRadius: '4px',
                }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: counts.contract > 0 ? '#3b82f6' : '#9ca3af', 
                    borderRadius: '50%' 
                  }} />
                  {counts.contract || 0} {counts.contract > 0 ? `(${getPercentage(counts.contract)}%)` : ''}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: counts.retired > 0 ? '#f59e0b' : '#9ca3af',
                  fontWeight: '600',
                  padding: '2px 4px',
                  backgroundColor: counts.retired > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  borderRadius: '4px',
                }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: counts.retired > 0 ? '#f59e0b' : '#9ca3af', 
                    borderRadius: '50%' 
                  }} />
                  {counts.retired || 0} {counts.retired > 0 ? `(${getPercentage(counts.retired)}%)` : ''}
                </div>
              </div>
            </div>
          )}

          {/* نمایش آمار خلاصه - همیشه نمایش داده می‌شود */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: (counts.military || counts.official) > 0 ? '#10b981' : '#9ca3af',
                fontWeight: '600',
                padding: '3px 6px',
                backgroundColor: (counts.military || counts.official) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '5px',
                minHeight: '24px',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: (counts.military || counts.official) > 0 ? '#10b981' : '#9ca3af', 
                borderRadius: '50%' 
              }} />
              {(counts.military ?? counts.official ?? 0)} نظامی
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: (counts.contractor || counts.contract) > 0 ? '#3b82f6' : '#9ca3af',
                fontWeight: '600',
                padding: '3px 6px',
                backgroundColor: counts.contract > 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '5px',
                minHeight: '24px',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: counts.contract > 0 ? '#3b82f6' : '#9ca3af', 
                borderRadius: '50%' 
              }} />
              {(counts.contractor ?? counts.contract ?? 0)} قراردادی
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: (counts.employee || 0) > 0 ? '#2563eb' : '#9ca3af',
                fontWeight: '600',
                padding: '3px 6px',
                backgroundColor: (counts.employee || 0) > 0 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '5px',
                minHeight: '24px',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: (counts.employee || 0) > 0 ? '#2563eb' : '#9ca3af', 
                borderRadius: '50%' 
              }} />
              {counts.employee || 0} کارمند
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: counts.retired > 0 ? '#f59e0b' : '#9ca3af',
                fontWeight: '600',
                padding: '3px 6px',
                backgroundColor: counts.retired > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '5px',
                minHeight: '24px',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: counts.retired > 0 ? '#f59e0b' : '#9ca3af', 
                borderRadius: '50%' 
              }} />
              {counts.retired || 0} بازنشسته
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                color: (counts.retiredMilitary || 0) > 0 ? '#f59e0b' : '#9ca3af',
                fontWeight: '600',
                padding: '3px 6px',
                backgroundColor: (counts.retiredMilitary || 0) > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '5px',
                minHeight: '24px',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: (counts.retiredMilitary || 0) > 0 ? '#f59e0b' : '#9ca3af', 
                borderRadius: '50%' 
              }} />
              {counts.retiredMilitary || 0} بازنشسته - نظامی
            </div>
          </div>

          {/* راهنمای دابل کلیک */}
          <div style={{
            fontSize: '9px',
            color: '#9ca3af',
            marginTop: '4px',
            fontStyle: 'italic',
            minHeight: '16px'
          }}>
            دابل کلیک برای جزئیات
          </div>
        </div>
      </div>

      {/* نشانگر فرزندان */}
      {Array.isArray(data.children) && data.children.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '3px 10px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {data.children.length} زیرمجموعه
        </div>
      )}

      {/* Handle پایین */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          backgroundColor: getLevelBorder(data.level || 0),
          width: '10px',
          height: '10px',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </div>
  );
});

const nodeTypes = { orgNode: OrgNode };

/* --------------------------- Helpers --------------------------- */
// آی‌دی پایدار بر اساس مسیر درخت؛ ریشه همیشه "root" است
const makeNodeId = (pathArr) => (pathArr.length === 0 ? 'root' : pathArr.join('-'));

// محاسبه پهنای زیردرخت برای چیدمان
const SUBTREE_NODE_WIDTH = 320;
const H_SPACING = 20;
const V_SPACING = 400;

function calcSubtreeWidth(node) {
  if (!node?.children || node.children.length === 0) return SUBTREE_NODE_WIDTH;
  let total = 0;
  node.children.forEach((child, i) => {
    total += calcSubtreeWidth(child);
    if (i < node.children.length - 1) total += H_SPACING;
  });
  return Math.max(total, SUBTREE_NODE_WIDTH);
}

// محاسبه آمار زیردرخت برای یک نود (Hoisted)
function computeStatsFor(rootNode) {
  const acc = {
    capacity: 0,
    totalPersonnel: 0,
    employee: 0,
    contractor: 0,
    military: 0,
    retired: 0,
    retiredMilitary: 0,
  };
  if (!rootNode) return acc;
  const walkStats = (node) => {
    if (!node) return;
    acc.capacity += 1;
    if (node.name && String(node.name).trim().length > 0) acc.totalPersonnel += 1;
    const type = node.employmentType || '';
    if (type === 'کارمند') acc.employee += 1;
    if (type === 'قرار دادی') acc.contractor += 1;
    if (type === 'نظامی') acc.military += 1;
    if (type === 'بازنشسته') acc.retired += 1;
    if (type === 'بازنشسته - نظامی') acc.retiredMilitary += 1;
    if (Array.isArray(node.children)) node.children.forEach(walkStats);
  };
  walkStats(rootNode);
  return acc;
}

/* --------------------------- Inner Component --------------------------- */
const ChartRendererInner = ({ data, onNodeClick }) => {
  const { fitView, getNode } = useReactFlow();
  const rfRef = useRef(null);
  const containerRef = useRef(null); // مرجع به کانتینر برای فول‌اسکرین
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(data || null);

    // دکمه‌ی فول‌اسکرین
    const handleFullscreen = () => {
      if (!containerRef.current) return;
  
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    };
  
  // nodes & edges (با آی‌دی پایدار + parentId)
  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodesAcc = [];
    const edgesAcc = [];

    const rootWidth = calcSubtreeWidth(data);
    const startX = -(rootWidth / 2) + SUBTREE_NODE_WIDTH / 2;

    const walk = (node, level = 0, parentPath = [], x = startX, y = 0) => {
      const path = parentPath; // path فعلی والد
      const id = makeNodeId(path);
      let nodeX = x;
      let nodeY = y + level * V_SPACING;

      if (node.children?.length) {
        let totalChildrenWidth = 0;
        const childMeta = node.children.map((child, idx) => {
          const w = calcSubtreeWidth(child);
          const cx = x + totalChildrenWidth;
          totalChildrenWidth += w + H_SPACING;
          return { child, cx, w };
        });

        if (totalChildrenWidth > 0) {
          nodeX = x + (totalChildrenWidth - H_SPACING) / 2;
        }

        childMeta.forEach(({ child, cx }, idx) => {
          const childPath = [...path, idx];
          const childId = makeNodeId(childPath);
          // ادامه‌ی پیمایش
          walk(child, level + 1, childPath, cx, y);

          // یال از این نود به کودک
          edgesAcc.push({
            id: `e-${id}-${childId}`,
            source: id,
            target: childId,
            type:  ConnectionLineType.SmoothStep,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            animated: false,
            markerEnd: { type: 'arrowclosed', width: 16, height: 16, color: '#3b82f6' },
          });
        });
      }

      nodesAcc.push({
        id,
        type: 'orgNode',
        position: { x: nodeX, y: nodeY },
        data: {
          ...node,
          level,
          parentId: path.length ? makeNodeId(path.slice(0, -1)) : null,
          subtreeStats: computeStatsFor(node),
          onNodeClick: () => {
            setSelectedNode(node);
            onNodeClick?.(node);
          },
          onMouseEnter: () => setHoveredNode(node),
          onMouseLeave: () => setHoveredNode(null),
        },
      });
    };

    // شروع از ریشه با مسیر []
    walk(data, 0, []);

    return { nodes: nodesAcc, edges: edgesAcc };
  }, [data, onNodeClick]);

  // محاسبه آمار زیردرخت انتخاب‌شده
  const subtreeStats = useMemo(() => computeStatsFor(selectedNode), [selectedNode]);

  // انتشار آمار انتخابی و هاور به صورت رویداد سفارشی
  useEffect(() => {
    const detail = { node: selectedNode, stats: subtreeStats };
    const event = new CustomEvent('chart:selectedStats', { detail });
    window.dispatchEvent(event);
  }, [selectedNode, subtreeStats]);

  useEffect(() => {
    const detail = hoveredNode ? { node: hoveredNode, stats: computeStatsFor(hoveredNode) } : null;
    const event = new CustomEvent('chart:hoverStats', { detail });
    window.dispatchEvent(event);
  }, [hoveredNode]);

  // فوکوس مطلق روی ریشه‌ی سازمانی (id = "root") بعد از رندر گراف
  const focusRoot = useRef(false);
  useLayoutEffect(() => {
    if (!data || nodes.length === 0) return;

    // یک فریم صبر کن تا ابعاد محاسبه شود
    requestAnimationFrame(() => {
      setTimeout(() => {
        const root = getNode('root');
        if (root) {
          fitView({
            nodes: [{ id: 'root' }],
            minZoom: 0.2,
            maxZoom: 1,
            padding: 0.2,
            duration: 800,
          });
          focusRoot.current = true;
        }
      }, 30);
    });
  }, [data, nodes, getNode, fitView]);

  if (!data) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #dbeafe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#6b7280' }}>در حال بارگذاری چارت درختی...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '800px' }}>
      {/* دکمه‌ی فول‌اسکرین */}
      <button
        onClick={handleFullscreen}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 30,
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid #d1d5db',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
      >
        ⛶ فول‌اسکرین
      </button>

      {/* Tooltip */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            border: '1px solid #e5e7eb',
            minWidth: '280px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#1f2937', marginBottom: '12px', textAlign: 'center' }}>
            {hoveredNode.label}
          </h3>
          {hoveredNode.name && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', textAlign: 'center', fontStyle: 'italic' }}>
              نام: {hoveredNode.name}
            </p>
          )}
          {hoveredNode.employmentType && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', textAlign: 'center' }}>
              نوع: {hoveredNode.employmentType}
            </p>
          )}
          {hoveredNode && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}
            >
              {(() => { const s = hoveredNode.subtreeStats || {}; return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>نظامی:</span>
                    <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.military || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>قراردادی:</span>
                    <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.contractor || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#2563eb', fontWeight: '600' }}>کارمند:</span>
                    <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.employee || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: '600' }}>بازنشسته:</span>
                    <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.retired || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: '600' }}>بازنشسته - نظامی:</span>
                    <span style={{ fontWeight: '700', color: '#1f2937' }}>{s.retiredMilitary || 0}</span>
                  </div>
                </>
              ); })()}
            </div>
          )}
        </div>
      )}

      {/* هدر حذف شد؛ آمار از طریق رویداد به Header ارسال می‌شود */}

      {/* Container */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView={false}
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: false, minZoom: 0.2, maxZoom: 1.5 }}
          attributionPosition="bottom-left"
          style={{ backgroundColor: 'transparent' }}
          defaultEdgeOptions={{
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            animated: false,
            markerEnd:{ type: 'arrowclosed', width: 16, height: 16, color: '#3b82f6' }
          }}
          connectionMode="loose"
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          panOnScroll={false}
          preventScrolling
          zoomActivationKeyCode="Meta"
          selectNodesOnDrag={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          snapToGrid={false}
          snapGrid={[25, 25]}
          onlyRenderVisibleElements
          translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
          nodeExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
          minZoom={0.2}
          maxZoom={3}
          onNodeClick={(_, node) => node?.data?.onNodeClick?.()}
          onNodeMouseEnter={(_, node) => node?.data?.onMouseEnter?.()}
          onNodeMouseLeave={(_, node) => node?.data?.onMouseLeave?.()}
        >
          <Controls
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
            showZoom
            showFitView
            showInteractive={false}
          />
          <Background color="#3b82f6" gap={50} size={1} style={{ opacity: 0.05 }} />
          <MiniMap
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
            nodeColor="#3b82f6"
            maskColor="rgba(59, 130, 246, 0.1)"
            zoomable
            pannable
            nodeStrokeWidth={2}
            nodeStrokeColor="#1e40af"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

/* --------------------------- Exported Wrapper --------------------------- */
export const ChartRenderer = ({ data, onNodeClick }) => {
  return (
    <ReactFlowProvider>
      <ChartRendererInner data={data} onNodeClick={onNodeClick} />
    </ReactFlowProvider>
  );
};

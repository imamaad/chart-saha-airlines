import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

// تعریف nodeTypes خارج از کامپوننت برای جلوگیری از re-render
const nodeTypes = {
  orgNode: ({ data }) => {
    const counts = data.counts || {};
    const total = (counts.official || 0) + (counts.contract || 0) + 
                 (counts.retired || 0) + (counts.partTime || 0);

    // رنگ‌بندی بر اساس سطح
    const getLevelColor = (level) => {
      const colors = [
        'linear-gradient(135deg, #3b82f6, #1d4ed8)', // ریشه
        'linear-gradient(135deg, #10b981, #059669)', // سطح 1
        'linear-gradient(135deg, #f59e0b, #d97706)', // سطح 2
        'linear-gradient(135deg, #8b5cf6, #7c3aed)', // سطح 3
        'linear-gradient(135deg, #ef4444, #dc2626)'  // سطح 4+
      ];
      return colors[Math.min(level, colors.length - 1)];
    };

    const getLevelBorder = (level) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
      return colors[Math.min(level, colors.length - 1)];
    };

    return (
      <div
        style={{
          padding: '20px',
          borderRadius: '20px',
          border: `4px solid ${getLevelBorder(data.level || 0)}`,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '320px',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transformOrigin: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.08) translateY(-8px)';
          e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.25)';
          e.target.style.borderColor = getLevelBorder((data.level || 0) + 1);
          data.onMouseEnter();
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) translateY(0)';
          e.target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
          e.target.style.borderColor = getLevelBorder(data.level || 0);
          data.onMouseLeave();
        }}
        onClick={data.onNodeClick}
      >
        {/* Handle برای اتصال از بالا */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            backgroundColor: '#3b82f6',
            width: '12px',
            height: '12px',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        />

        {/* نشانگر سطح */}
        <div style={{
          position: 'absolute',
          top: '-16px',
          right: '-16px',
          width: '40px',
          height: '40px',
          background: getLevelColor(data.level || 0),
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          border: '3px solid white'
        }}>
          <span style={{
            color: 'white',
            fontWeight: '700',
            fontSize: '14px'
          }}>
            {data.level + 1}
          </span>
        </div>

        {/* آیکون نوع گره */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '18px', height: '18px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        {/* عنوان اصلی */}
        <div style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '10px',
          lineHeight: '1.3',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          {data.label}
        </div>
        
        {/* نام پرسنل */}
        {data.name && (
          <div style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            {data.name}
          </div>
        )}
        
        {/* نوع استخدام */}
        {data.employmentType && (
          <div style={{
            fontSize: '13px',
            color: '#9ca3af',
            marginBottom: '16px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            borderRadius: '12px',
            display: 'inline-block',
            fontWeight: '500',
            border: '1px solid #d1d5db'
          }}>
            {data.employmentType}
          </div>
        )}
        
        {/* آمار کارکنان */}
        {total > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#3b82f6',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid #bfdbfe',
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.1)'
            }}>
              {total} نفر
            </div>
            
            {/* جزئیات آمار */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              marginTop: '8px'
            }}>
              {counts.official > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#10b981',
                  fontWeight: '600',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%'
                  }}></div>
                  {counts.official} نظامی
                </div>
              )}
              {counts.contract > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#3b82f6',
                  fontWeight: '600',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%'
                  }}></div>
                  {counts.contract} قراردادی
                </div>
              )}
              {counts.retired > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#f59e0b',
                  fontWeight: '600',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%'
                  }}></div>
                  {counts.retired} بازنشسته
                </div>
              )}
              {counts.partTime > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#8b5cf6',
                  fontWeight: '600',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '50%'
                  }}></div>
                  {counts.partTime} پاره‌وقت
                </div>
              )}
            </div>
          </div>
        )}

        {/* نشانگر فرزندان */}
        {data.children && data.children.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {data.children.length} زیرمجموعه
          </div>
        )}

        {/* Handle برای اتصال به پایین */}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            backgroundColor: '#3b82f6',
            width: '12px',
            height: '12px',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>
    );
  }
};

export const ChartRenderer = ({ data, onNodeClick }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // تبدیل داده‌ها به فرمت React Flow با چیدمان درختی
  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    let nodeCounter = 0;

    // تابع محاسبه موقعیت درختی
    const calculateTreeLayout = (node, level = 0, parentId = null, x = 0, y = 0) => {
      const currentNodeId = `node-${nodeCounter++}`;
      
      // محاسبه موقعیت درختی
      const levelHeight = 300; // فاصله بین سطوح
      const nodeSpacing = 450; // فاصله بین گره‌ها در یک سطح
      
      let nodeX = x;
      let nodeY = y + (level * levelHeight);
      
      // اگر فرزندان داریم، موقعیت را بر اساس آنها تنظیم کنیم
      if (node.children && node.children.length > 0) {
        const childrenWidth = (node.children.length - 1) * nodeSpacing;
        nodeX = x - (childrenWidth / 2);
      }

      // ایجاد گره
      nodes.push({
        id: currentNodeId,
        type: 'orgNode',
        position: { x: nodeX, y: nodeY },
        data: {
          ...node,
          level,
          onNodeClick: () => onNodeClick(node),
          onMouseEnter: () => setHoveredNode(node),
          onMouseLeave: () => setHoveredNode(null)
        }
      });

      // ایجاد لینک به والد
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${currentNodeId}`,
          source: parentId,
          target: currentNodeId,
          type: 'smoothstep',
          style: { 
            stroke: '#3b82f6', 
            strokeWidth: 3,
            strokeDasharray: '8,8'
          },
          animated: true,
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#3b82f6'
        }
      });
    }

      // پردازش فرزندان
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          const childX = nodeX + (childIndex * nodeSpacing);
          calculateTreeLayout(child, level + 1, currentNodeId, childX, nodeY);
        });
      }

      return { x: nodeX, y: nodeY };
    };

    // شروع از ریشه
    calculateTreeLayout(data, 0, null, 0, 0);

    return { nodes, edges };
  }, [data, onNodeClick]);

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #dbeafe',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>در حال بارگذاری چارت درختی...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '700px' }}>
      {/* Tooltip پیشرفته */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          border: '1px solid #e5e7eb',
          minWidth: '280px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontWeight: '800',
            fontSize: '18px',
            color: '#1f2937',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            {hoveredNode.label}
          </h3>
          {hoveredNode.name && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              نام: {hoveredNode.name}
            </p>
          )}
          {hoveredNode.employmentType && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              نوع: {hoveredNode.employmentType}
            </p>
          )}
          {hoveredNode.counts && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#10b981', fontWeight: '600' }}>نظامی:</span>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>{hoveredNode.counts.official || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>قراردادی:</span>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>{hoveredNode.counts.contract || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#f59e0b', fontWeight: '600' }}>بازنشسته:</span>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>{hoveredNode.counts.retired || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>پاره‌وقت:</span>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>{hoveredNode.counts.partTime || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* کانتینر چارت */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        height: '100%',
        overflow: 'hidden'
      }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
            style={{
              backgroundColor: 'transparent'
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { 
                stroke: '#3b82f6', 
                strokeWidth: 3,
                strokeDasharray: '8,8'
              },
              animated: true,
              markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20,
                color: '#3b82f6'
              }
            }}
            connectionMode="loose"
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            preventScrolling={true}
            zoomActivationKeyCode="Meta"
            selectNodesOnDrag={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            snapToGrid={false}
            snapGrid={[15, 15]}
            onlyRenderVisibleElements={false}
            translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
            nodeExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
            minZoom={0.1}
            maxZoom={4}
            onNodeClick={(event, node) => {
              node.data.onNodeClick();
            }}
            onNodeMouseEnter={(event, node) => {
              node.data.onMouseEnter();
            }}
            onNodeMouseLeave={(event, node) => {
              node.data.onMouseLeave();
            }}
          >
            <Controls 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}
            />
            <Background 
              color="#3b82f6" 
              gap={30}
              size={2}
              style={{ opacity: 0.08 }}
            />
            <MiniMap
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}
              nodeColor="#3b82f6"
              maskColor="rgba(59, 130, 246, 0.1)"
              zoomable
              pannable
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};
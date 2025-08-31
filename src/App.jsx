import React, { useState, useEffect } from 'react';
import { DataManager } from './components/DataManager';
import { ChartRenderer } from './components/ChartRenderer';
import { ListRenderer } from './components/ListRenderer';
import { Breadcrumb } from './components/Breadcrumb';
import { ErrorHandler } from './components/ErrorHandler';
import { Header } from './components/Header';

function App() {
  const [viewMode, setViewMode] = useState('chart');
  const [currentNode, setCurrentNode] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const dataManager = new DataManager();
  const errorHandler = new ErrorHandler();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentNode) {
      updateBreadcrumb();
    }
  }, [currentNode]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fullData = await dataManager.loadData();
      setData(fullData);
      setCurrentNode(fullData);
      errorHandler.showSuccess('داده‌ها با موفقیت بارگذاری شدند');
    } catch (err) {
      setError(err.message);
      errorHandler.handle(err, 'Data loading');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBreadcrumb = () => {
    if (!currentNode) return;
    
    const path = dataManager.findPathToNode(data, currentNode.id) || [];
    setBreadcrumb(path);
  };

  const handleNodeClick = (node) => {
    try {
      dataManager.loadChildrenIfNeeded(node);
      setCurrentNode(node);
      window.location.hash = encodeURIComponent(node.id);
      updateBreadcrumb();
    } catch (err) {
      setError(err.message);
      errorHandler.handle(err, 'Node click');
    }
  };

  const handleBreadcrumbClick = (node) => {
    try {
      // پیدا کردن گره در داده‌های اصلی
      const targetNode = dataManager.getNodeById(node.id);
      if (targetNode) {
        setCurrentNode(targetNode);
        window.location.hash = encodeURIComponent(node.id);
        updateBreadcrumb();
      }
    } catch (err) {
      setError(err.message);
      errorHandler.handle(err, 'Breadcrumb click');
    }
  };

  const toggleView = () => {
    setViewMode(prev => prev === 'chart' ? 'list' : 'chart');
  };

  const updateTitle = (text) => {
    document.title = text || 'چارت سازمانی داینامیک';
  };

  useEffect(() => {
    if (currentNode) {
      updateTitle(currentNode.label);
    }
  }, [currentNode]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #dbeafe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '64px',
              height: '64px',
              border: '4px solid transparent',
              borderTop: '4px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              animationDelay: '0.5s',
              margin: '0 auto'
            }}></div>
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>در حال بارگذاری...</h2>
          <p style={{ color: '#6b7280' }}>لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px'
          }}>خطا در بارگذاری</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={loadData}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg style={{ width: '20px', height: '20px', marginLeft: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <Header 
          title={currentNode?.label || 'چارت سازمانی'}
          viewMode={viewMode}
          onToggleView={toggleView}
        />
        
        <Breadcrumb 
          path={breadcrumb}
          onItemClick={handleBreadcrumbClick}
        />
        
        <div style={{ marginTop: '24px' }}>
          {viewMode === 'chart' ? (
            <ChartRenderer 
              data={currentNode}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <ListRenderer 
              data={currentNode}
              onRowClick={handleNodeClick}
            />
          )}
        </div>
        
        {/* Footer */}
        <footer style={{
          marginTop: '48px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>© 2024 شرکت هواپیمایی ساها - چارت سازمانی داینامیک</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
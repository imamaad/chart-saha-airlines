import React, { useState, useEffect } from 'react';

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.listeners = [];
  }

  handle(error, context = '') {
    const errorInfo = {
      message: error.message || error.toString(),
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
    
    this.errors.push(errorInfo);
    console.error(`Error in ${context}:`, error);
    
    this.notifyListeners(errorInfo);
  }

  showSuccess(message) {
    console.log('Success:', message);
    // می‌توانید اینجا notification system اضافه کنید
  }

  showError(message) {
    console.error('Error:', message);
    // می‌توانید اینجا notification system اضافه کنید
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(errorInfo) {
    this.listeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

// React Component برای نمایش خطاها
export const ErrorDisplay = ({ error, onRetry }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!error || !isVisible) return null;

  return (
    <div className="error-message">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">خطا</h3>
          <p>{error.message}</p>
          {error.context && (
            <p className="text-sm text-gray-600 mt-1">مکان: {error.context}</p>
          )}
        </div>
        <div className="flex space-x-2 space-x-reverse">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
            >
              تلاش مجدد
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook برای استفاده از ErrorHandler
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [errorHandler] = useState(() => new ErrorHandler());

  useEffect(() => {
    const handleError = (errorInfo) => {
      setError(errorInfo);
    };

    errorHandler.addListener(handleError);
    return () => errorHandler.removeListener(handleError);
  }, [errorHandler]);

  const clearError = () => setError(null);

  return { error, errorHandler, clearError };
};
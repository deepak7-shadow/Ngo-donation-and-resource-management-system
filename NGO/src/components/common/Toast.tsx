import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { ToastMessage } from '../../types';

export const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { dispatch } = useNGO();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />;
      default:
        return <Info size={20} style={{ color: 'var(--color-info)', flexShrink: 0 }} />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive">
      {getIcon()}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: '0 0 2px 0' }}>
          {toast.title}
        </h4>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
        aria-label="Dismiss notification"
        style={{
          color: 'var(--color-text-subtle)',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { state } = useNGO();

  if (state.toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications" role="region">
      {state.toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

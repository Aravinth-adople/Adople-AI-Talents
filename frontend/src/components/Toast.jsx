import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-area">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        return (
          <div key={toast.id} className={`clean-toast ${toast.type}`}>
            {isSuccess ? (
              <CheckCircle2 size={16} color="#059669" />
            ) : (
              <AlertCircle size={16} color="#dc2626" />
            )}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

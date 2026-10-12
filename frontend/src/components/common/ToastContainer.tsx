import React from 'react';
import { useLMS } from '../../context/LMSContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLMS();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const bgColors = {
          success: 'bg-emerald-600 text-white',
          error: 'bg-rose-600 text-white',
          info: 'bg-indigo-600 text-white'
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 shrink-0" />,
          info: <Info className="w-5 h-5 shrink-0" />
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/50 text-xs font-semibold animate-fade-in ${bgColors[toast.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

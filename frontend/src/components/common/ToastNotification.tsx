import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toasts, dismissToast } = useBrandGuard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconConfig = {
          success: { icon: CheckCircle2, border: 'border-[#00FFA3]/50 shadow-[0_0_12px_rgba(0,255,163,0.3)]', text: 'text-[#00FFA3]', bg: 'bg-[#00050B]/95' },
          warning: { icon: AlertTriangle, border: 'border-amber-500/40', text: 'text-amber-400', bg: 'bg-[#00050B]/95' },
          error: { icon: AlertCircle, border: 'border-red-500/40', text: 'text-red-400', bg: 'bg-[#00050B]/95' },
          info: { icon: Info, border: 'border-[#00E5FF]/50', text: 'text-[#00E5FF]', bg: 'bg-[#00050B]/95' },
        }[toast.type];

        const IconComponent = iconConfig.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${iconConfig.border} ${iconConfig.bg} shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200`}
            role="alert"
          >
            <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconConfig.text}`} />
            <div className="flex-1 text-xs text-slate-200 leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

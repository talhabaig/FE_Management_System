import type { ReactNode } from 'react';

type AlertTone = 'error' | 'success' | 'info';

const toneClass: Record<AlertTone, string> = {
  error: 'border-danger/30 bg-danger/10 text-danger',
  success: 'border-moss/30 bg-moss/10 text-moss',
  info: 'border-pine/20 bg-pine/5 text-pine',
};

export function Alert({ tone, children }: { tone: AlertTone; children: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${toneClass[tone]}`}>
      {children}
    </div>
  );
}

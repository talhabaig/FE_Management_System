import type { ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const variantClass: Record<BadgeVariant, string> = {
  neutral: 'bg-sand text-ink',
  info: 'bg-pine/10 text-pine',
  success: 'bg-moss/15 text-moss',
  warning: 'bg-gold/15 text-gold',
  danger: 'bg-danger/10 text-danger',
};

export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClass[variant]}`}>
      {children}
    </span>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-clay text-white hover:bg-[#9a4522] disabled:hover:bg-clay',
  secondary: 'border border-sand bg-card text-ink hover:bg-sand/70 disabled:hover:bg-card',
  danger: 'bg-danger text-white hover:bg-[#742424] disabled:hover:bg-danger',
  ghost: 'bg-transparent text-ink hover:bg-sand/80 disabled:hover:bg-transparent',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'disabled'> {
  variant?: ButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        fullWidth ? 'w-full' : '',
      ].join(' ')}
      {...props}
    >
      {isLoading ? <Spinner label="Working" /> : null}
      {children}
    </button>
  );
}

import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'name' | 'size'> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
}

export function TextField({ label, name, error, hint, registration, id, ...props }: TextFieldProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="block">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-lg border border-sand bg-card px-3 py-2 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/40 focus:border-clay disabled:cursor-not-allowed disabled:bg-sand/50"
        {...(registration ?? { name })}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-ink/65">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

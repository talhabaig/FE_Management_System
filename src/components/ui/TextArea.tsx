import type { TextareaHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'name'> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
}

export function TextArea({ label, name, error, hint, registration, id, rows = 4, ...props }: TextAreaProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="block">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
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

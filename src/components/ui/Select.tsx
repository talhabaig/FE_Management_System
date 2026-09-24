import type { SelectHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'children'> {
  label: string;
  name: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
  registration?: UseFormRegisterReturn;
}

export function Select({
  label,
  name,
  options,
  error,
  hint,
  placeholder,
  registration,
  id,
  ...props
}: SelectProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="block">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-lg border border-sand bg-card px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-clay disabled:cursor-not-allowed disabled:bg-sand/50"
        {...(registration ?? { name })}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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

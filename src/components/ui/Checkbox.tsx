import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type' | 'name' | 'size'> {
  label: string;
  name: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export function Checkbox({ label, name, error, registration, id, ...props }: CheckboxProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <label htmlFor={fieldId} className="flex items-start gap-3 text-sm text-ink">
        <input
          id={fieldId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-4 rounded border-sand text-clay accent-clay"
          {...(registration ?? { name })}
          {...props}
        />
        <span className="font-medium">{label}</span>
      </label>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

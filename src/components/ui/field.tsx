import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { INPUT_CLASS } from '../../lib/styles';

interface FieldWrapProps {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

/** Label, hint and error wrapper. Wires aria-describedby and aria-invalid for keyboard/screen-reader users. */
export function Field({ label, hint, error, children }: FieldWrapProps) {
  const id = useId();
  const hintId = hint || error ? `${id}-desc` : undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-700">
        {label}
      </label>
      {children(id, hintId)}
      {error ? (
        <p id={hintId} className="text-[10px] text-red-600">{error}</p>
      ) : hint ? (
        <p id={hintId} className="text-[10px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, hint, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id, describedBy) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={!!error} className={INPUT_CLASS} {...rest} />
      )}
    </Field>
  );
}

export function Select({ label, hint, error, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id, describedBy) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={!!error} className={`${INPUT_CLASS} pr-7`} {...rest}>
          {children}
        </select>
      )}
    </Field>
  );
}

export function Textarea({ label, hint, error, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id, describedBy) => (
        <textarea id={id} aria-describedby={describedBy} aria-invalid={!!error} className={`${INPUT_CLASS} h-auto py-2`} rows={3} {...rest} />
      )}
    </Field>
  );
}

/** Search box used in toolbars. */
export function SearchInput({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <input type="search" aria-label={label} className={`${INPUT_CLASS} w-56`} {...rest} />
  );
}

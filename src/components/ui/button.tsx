import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClass, type ButtonSize, type ButtonVariant } from '../../lib/styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

/** The only button in the app. Variants and sizes come from lib/styles. */
export function Button({ variant = 'primary', size = 'md', loading = false, icon, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} className={`${buttonClass(variant, size)} ${className}`} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

/** Icon-only button with a required accessible name. */
export function IconButton({ label, children, className = '', onClick, disabled }: { label: string; children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-control text-slate-500 hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

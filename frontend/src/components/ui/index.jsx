import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Button ──────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-muted hover:text-foreground',
    ghost: 'hover:bg-muted hover:text-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    muted: 'bg-muted text-muted-foreground',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
};

// ── Card ───────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '' }) => (
  <div className={cn('bg-card border border-border rounded-lg shadow-sm', className)}>
    {children}
  </div>
);
export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('p-5 border-b border-border', className)}>{children}</div>
);
export const CardBody = ({ children, className = '' }) => (
  <div className={cn('p-5', className)}>{children}</div>
);

// ── Spinner ────────────────────────────────────────────────────────────────
export const Spinner = ({ className = '' }) => (
  <div className={cn('h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin', className)} role="status" aria-label="Loading" />
);

// ── Empty State ────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
    {Icon && <Icon className="h-12 w-12 text-muted-foreground/30 mb-4" />}
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ── Input ──────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ── Select ─────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ── Textarea ───────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <textarea
      rows={4}
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        error && 'border-destructive',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ── Modal ──────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ── Status badge helper ────────────────────────────────────────────────────
export const statusVariant = (status = '') => {
  const s = status.toLowerCase();
  if (['active', 'completed', 'filled', 'resulted'].includes(s)) return 'success';
  if (['pending', 'ordered', 'scheduled'].includes(s)) return 'info';
  if (['cancelled', 'discontinued', 'rejected'].includes(s)) return 'danger';
  if (['on hold', 'in progress', 'processing'].includes(s)) return 'warning';
  return 'muted';
};

import type { Tone } from '../api/types';

/** Hex values used by charts and inline styles. Keep in sync with tailwind.config.js. */
export const TONE_HEX: Record<Tone, string> = {
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#7c3aed',
  orange: '#f97316',
  red: '#dc2626',
  amber: '#d97706',
  teal: '#0d9488',
  indigo: '#4f46e5',
};

/** Tailwind classes for tinted icon tiles, keyed by tone. */
export const TONE_TILE: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-violet-50 text-violet-600',
  orange: 'bg-orange-50 text-orange-500',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  teal: 'bg-teal-50 text-teal-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

/** Solid background classes for avatars, keyed by tone. */
export const TONE_AVATAR: Record<Tone, string> = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-violet-600',
  orange: 'bg-orange-500',
  red: 'bg-red-600',
  amber: 'bg-amber-500',
  teal: 'bg-teal-600',
  indigo: 'bg-indigo-600',
};

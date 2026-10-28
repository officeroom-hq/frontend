/** @type {import('tailwindcss').Config} */
// Officeroom design tokens. Mirror hex values in src/lib/tones.ts when changed.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e40af', 600: '#1e40af', 500: '#2563eb', 100: '#dbeafe', 50: '#eff6ff' },
        nav: '#1e3a8a',
        page: '#f4f6fa',
        ink: '#111827',
        muted: '#6b7280',
        line: '#e5e7eb',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        accent: '#7c3aed',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        micro: ['10px', '14px'],
        caption: ['11px', '16px'],
        body: ['12px', '18px'],
        title: ['13px', '18px'],
        heading: ['22px', '28px'],
        kpi: ['20px', '24px'],
      },
      borderRadius: {
        card: '10px',
        control: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        pop: '0 12px 32px -8px rgba(15, 23, 42, 0.28), 0 2px 6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

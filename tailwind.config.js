/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy tokens (keep for existing pages)
        background: "#F8FAFC",
        'background-dark': "#000000",
        surface: "#FFFFFF",
        'surface-dark': "#000000",
        surface2: "#F1F5F9",
        'surface2-dark': "#1a1a1a",
        border: "#E5E7EB",
        'border-dark': "#333333",
        text: "#111827",
        'text-dark': "#FFFFFF",
        mutedText: "#6B7280",
        'mutedText-dark': "#CCCCCC",
        primary: "#6EA8FF",
        warning: "#FFC857",
        danger: "#FF6B6B",
        success: "#49D49D",
        info: "#7DD3FC",

        // New design system tokens
        'ds-bg': 'var(--color-bg)',
        'ds-bg-subtle': 'var(--color-bg-subtle)',
        'ds-sidebar': 'var(--color-sidebar)',
        'ds-fg': 'var(--color-fg)',
        'ds-fg-muted': 'var(--color-fg-muted)',
        'ds-fg-subtle': 'var(--color-fg-subtle)',
        'ds-border': 'var(--color-border)',
        'ds-border-strong': 'var(--color-border-strong)',
        'ds-accent': 'var(--color-accent)',
        'ds-accent-subtle': 'var(--color-accent-subtle)',
        'ds-accent-fg': 'var(--color-accent-fg)',
      },
      fontSize: {
        h1: "28px",
        h2: "22px",
        h3: "18px",
        body: "14px",
        small: "12px",
      },
      borderRadius: {
        card: "16px",
        control: "12px",
      },
      maxWidth: {
        layout: "1200px",
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}

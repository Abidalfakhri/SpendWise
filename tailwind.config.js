// tailwind.config.js
export default {
  darkMode: 'class', 
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // Integrasi dengan variabel CSS di theme.css
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        primary: 'var(--color-primary)',
        primary600: 'var(--color-primary-600)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
};

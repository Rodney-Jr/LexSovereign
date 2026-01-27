/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: 'var(--brand-bg)',
                    sidebar: 'var(--brand-sidebar)',
                    border: 'var(--brand-border)',
                    primary: 'var(--brand-primary)',
                    secondary: 'var(--brand-secondary)',
                    text: 'var(--brand-text)',
                    muted: 'var(--brand-muted)',
                }
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./src/components/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'neon-cyan': '#00FFFF',
                'neon-purple': '#8B5CF6',
                'neon-pink': '#FF00FF',
                'glass-bg': 'rgba(255, 255, 255, 0.05)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'gbc-purple': '#8B5CF6',
                'gbc-grape': '#6B5B95',
                'gbc-teal': '#00CED1',
            },
            fontFamily: {
                'retro': ['"Press Start 2P"', 'cursive'],
                'body': ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                'glass': '12px',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
                'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
            },
        },
    },
    plugins: [],
}

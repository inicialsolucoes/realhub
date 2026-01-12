/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#0ea5e9', // Sky 500
                    DEFAULT: '#1d4ed8', // Blue 700
                    dark: '#1e3a8a', // Blue 900
                    darker: '#0b1726', // Custom Dark
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

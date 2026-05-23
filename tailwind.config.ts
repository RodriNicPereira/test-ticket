import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"], // Archivos que Tailwind escaneará
  theme: {
   extend: {
      // Aquí añades tus propios colores, fuentes, etc.
      screens: { xs: '350px', ...defaultTheme.screens }
    },
  },
  plugins: [], // Plugins adicionales como typography o forms
}

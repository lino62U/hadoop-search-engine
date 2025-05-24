import type { Config } from 'tailwindcss';
import  neutral  from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        secondary: {
          DEFAULT: neutral[200],
          hover: neutral[300],
          border: neutral[400],
          text: neutral[500],
          dark: neutral[800],
          ["dark-hover"]: neutral[900],
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
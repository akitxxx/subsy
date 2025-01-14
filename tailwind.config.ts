import animate from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(199, 89%, 70%)',
          50: 'hsl(199, 89%, 95%)',
          100: 'hsl(199, 89%, 90%)',
          200: 'hsl(199, 89%, 80%)',
          300: 'hsl(199, 89%, 70%)',
          400: 'hsl(199, 89%, 60%)',
          500: 'hsl(199, 89%, 50%)',
          600: 'hsl(199, 89%, 40%)',
          700: 'hsl(199, 89%, 30%)',
          800: 'hsl(199, 89%, 20%)',
          900: 'hsl(199, 89%, 10%)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(222.2, 47.4%, 11.2%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
          50: 'hsl(0, 84.2%, 95%)',
          100: 'hsl(0, 84.2%, 90%)',
          200: 'hsl(0, 84.2%, 80%)',
          300: 'hsl(0, 84.2%, 70%)',
          400: 'hsl(0, 84.2%, 60.2%)',
          500: 'hsl(0, 84.2%, 50%)',
          600: 'hsl(0, 84.2%, 40%)',
          700: 'hsl(0, 84.2%, 30%)',
          800: 'hsl(0, 84.2%, 20%)',
          900: 'hsl(0, 84.2%, 10%)',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(215.4, 16.3%, 46.9%)',
        },
        accent: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(222.2, 47.4%, 11.2%)',
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

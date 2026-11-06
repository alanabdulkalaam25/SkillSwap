/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '2rem',
        lg: '2.5rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary-muted))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          muted: 'hsl(var(--destructive-muted))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          muted: 'hsl(var(--success-muted))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          muted: 'hsl(var(--warning-muted))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontSize: {
        /* Fluid display + heading scale: grows with the viewport, then stops. */
        'display-xl': ['clamp(2.75rem, 1.9rem + 4.2vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.045em', fontWeight: '600' }],
        'display-lg': ['clamp(2.35rem, 1.7rem + 3.2vw, 3.75rem)', { lineHeight: '1.06', letterSpacing: '-0.04em', fontWeight: '600' }],
        'display-md': ['clamp(1.875rem, 1.45rem + 2vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.035em', fontWeight: '600' }],
        'display-sm': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '1.18', letterSpacing: '-0.025em', fontWeight: '600' }],
        'heading-xl': ['clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-lg': ['clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)', { lineHeight: '1.3', letterSpacing: '-0.018em', fontWeight: '600' }],
        'heading-md': ['clamp(1.125rem, 1.06rem + 0.28vw, 1.25rem)', { lineHeight: '1.35', letterSpacing: '-0.012em', fontWeight: '600' }],
        'heading-sm': ['clamp(1rem, 0.97rem + 0.15vw, 1.0938rem)', { lineHeight: '1.4', letterSpacing: '-0.008em', fontWeight: '600' }],
        /* Fluid body scale: keeps long-form copy readable at every width. */
        'body-lg': ['clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)', { lineHeight: '1.65' }],
        body: ['clamp(0.9375rem, 0.92rem + 0.15vw, 1.0313rem)', { lineHeight: '1.65' }],
        'body-sm': ['clamp(0.875rem, 0.855rem + 0.1vw, 0.9375rem)', { lineHeight: '1.6' }],
        caption: ['clamp(0.8125rem, 0.8rem + 0.06vw, 0.875rem)', { lineHeight: '1.5' }],
        'caption-sm': ['clamp(0.75rem, 0.74rem + 0.05vw, 0.8125rem)', { lineHeight: '1.5' }],
        micro: ['clamp(0.6875rem, 0.68rem + 0.04vw, 0.75rem)', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        prose: '68ch',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(9 9 11 / 0.04), 0 12px 32px -24px rgb(9 9 11 / 0.12)',
        'soft-lg': '0 2px 6px 0 rgb(9 9 11 / 0.05), 0 24px 56px -32px rgb(9 9 11 / 0.18)',
        card: '0 1px 2px 0 rgb(9 9 11 / 0.04)',
        'card-hover': '0 2px 6px 0 rgb(9 9 11 / 0.05), 0 16px 32px -28px rgb(9 9 11 / 0.16)',
        focus: '0 0 0 2px hsl(var(--ring))',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '180ms',
        slow: '280ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 180ms ease-out',
        'fade-out': 'fadeOut 140ms ease-in',
        'slide-up': 'slideUp 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

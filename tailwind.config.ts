import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        card: '#f9f9f9',
        'card-foreground': '#000000',
        primary: '#0066cc',
        'primary-foreground': '#ffffff',
        secondary: '#f0f0f0',
        'secondary-foreground': '#000000',
        muted: '#e5e5e5',
        'muted-foreground': '#666666',
        accent: '#0066cc',
        'accent-foreground': '#ffffff',
        destructive: '#dc2626',
        border: '#e5e5e5',
        input: '#f5f5f5',
        ring: '#0066cc',
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.425rem',
        sm: '0.225rem',
      },
    },
  },
  plugins: [],
}
export default config

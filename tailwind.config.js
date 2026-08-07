/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1.5rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: '#7C3AED',
  				foreground: '#FFFFFF',
  				glow: 'rgba(124, 58, 237, 0.4)'
  			},
  			secondary: {
  				DEFAULT: '#06B6D4',
  				foreground: '#FFFFFF',
  				glow: 'rgba(6, 182, 212, 0.4)'
  			},
  			success: {
  				DEFAULT: '#22C55E',
  				foreground: '#FFFFFF'
  			},
  			danger: {
  				DEFAULT: '#EF4444',
  				foreground: '#FFFFFF'
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				foreground: '#FFFFFF'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			gaming: {
  				darkBg: '#0B0F17',
  				obsidian: '#030712',
  				cardGlass: 'rgba(15, 23, 42, 0.65)',
  				lightGlass: 'rgba(255, 255, 255, 0.75)',
  				borderGlass: 'rgba(255, 255, 255, 0.12)',
  				purpleGlow: '0 0 25px rgba(124, 58, 237, 0.35)',
  				cyanGlow: '0 0 25px rgba(6, 182, 212, 0.35)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: '24px',
  			md: '18px',
  			sm: '12px',
  			xl: '28px'
  		},
  		animation: {
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'glow-spin': 'spin 12s linear infinite',
  			float: 'float 6s ease-in-out infinite',
  			'gradient-x': 'gradient-x 8s ease infinite'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'gradient-x': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '4px',
  			glass: '16px',
  			heavy: '24px'
  		}
  	}
  },
  plugins: [],
}

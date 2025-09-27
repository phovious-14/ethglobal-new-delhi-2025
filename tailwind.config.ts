import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Space Grotesk',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'"Noto Sans"',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"'
				],
				mono: [
					'Space Grotesk',
					'ui-monospace',
					'SFMono-Regular',
					'"SF Mono"',
					'Consolas',
					'"Liberation Mono"',
					'Menlo',
					'Monaco',
					'Courier',
					'monospace'
				],
				display: [
					'Space Grotesk',
					'Inter',
					'system-ui',
					'sans-serif'
				],
				heading: [
					'Space Grotesk',
					'Inter',
					'system-ui',
					'sans-serif'
				]
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
				'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'heading': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'subheading': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }]
			},
			fontWeight: {
				thin: '100',
				extralight: '200',
				light: '300',
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
				extrabold: '800',
				black: '900',
				'extra-black': '950'
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
				normal: '0em',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em',
				'ultra-wide': '0.15em'
			},
			lineHeight: {
				none: '1',
				tight: '1.25',
				snug: '1.375',
				normal: '1.5',
				relaxed: '1.625',
				loose: '2',
				'extra-loose': '2.5'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				brutal: {
					black: '#000000',
					white: '#ffffff',
					gray: {
						'50': '#f9fafb',
						'100': '#f3f4f6',
						'200': '#e5e7eb',
						'300': '#d1d5db',
						'400': '#9ca3af',
						'500': '#6b7280',
						'600': '#4b5563',
						'700': '#374151',
						'800': '#1f2937',
						'900': '#111827'
					}
				},
				drip: {
					primary: '#000000',
					secondary: '#ffffff',
					accent: '#f3f4f6',
					border: '#000000',
					text: {
						primary: '#000000',
						secondary: '#6b7280',
						inverse: '#ffffff'
					},
					background: {
						primary: '#ffffff',
						secondary: '#f9fafb',
						tertiary: '#f3f4f6',
						dark: '#000000'
					}
				},
				icon: {
					blue: '#3b82f6',
					green: '#10b981',
					purple: '#8b5cf6',
					red: '#ef4444',
					yellow: '#f59e0b',
					indigo: '#6366f1',
					pink: '#ec4899',
					teal: '#14b8a6',
					orange: '#f97316',
					cyan: '#06b6d4'
				},
				status: {
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444',
					info: '#3b82f6'
				},
				social: {
					twitter: '#1da1f2',
					discord: '#7289da',
					telegram: '#0088cc'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderWidth: {
				'3': '3px',
				'5': '5px',
				'6': '6px'
			},
			boxShadow: {
				brutal: '4px 4px 0px 0px #000000',
				'brutal-sm': '2px 2px 0px 0px #000000',
				'brutal-lg': '8px 8px 0px 0px #000000',
				'brutal-white': '4px 4px 0px 0px #ffffff'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				shimmer: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'spin-slow': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'spin-slow-reverse': {
					'0%': {
						transform: 'rotate(360deg)'
					},
					'100%': {
						transform: 'rotate(0deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				shimmer: 'shimmer 2s infinite',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'spin-slow': 'spin-slow 8s linear infinite',
				'spin-slow-reverse': 'spin-slow-reverse 12s linear infinite'
			}
		}
	},
	plugins: [require('tailwindcss-animate')],
};
export default config;

const tokens = {
	'--shadow-default': '0 1px 3px rgba(0, 0, 0, 0.08)',
	'--shadow-heavy': '0 2px 3px rgba(0, 0, 0, 0.35)',
	'--shadow-theme-light-ambience-purple-shadow-1-px':
		'0px 0px 2px rgba(0, 0, 0, 0.14), 0px 2px 2px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(108, 92, 231, 0.2)',
	'--shadow-theme-light-ambience-purple-shadow-4-px':
		'0px 2px 4px rgba(0, 0, 0, 0.14), 0px 5px 5px rgba(0, 0, 0, 0.12), 0px 1px 10px rgba(108, 92, 231, 0.2)',
	'--shadow-theme-light-ambience-purple-shadow-8-px':
		'0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 3px rgba(0, 0, 0, 0.12), 0px 4px 15px rgba(108, 92, 231, 0.2)',
	'--shadow-theme-light-ambience-purple-shadow-16-px':
		'0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12), 0px 8px 10px 3px rgba(108, 92, 231, 0.2)',
	'--shadow-theme-light-ambience-purple-shadow-24-px':
		'0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12), 0px 11px 15px 8px rgba(108, 92, 231, 0.2)',
	'--shadow-theme-light-ambience-black-shadow-1-px':
		'0px 0px 2px rgba(0, 0, 0, 0.14), 0px 2px 2px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.2)',
	'--shadow-theme-light-ambience-black-shadow-4-px':
		'0px 2px 4px rgba(0, 0, 0, 0.14), 0px 5px 5px rgba(0, 0, 0, 0.12), 0px 1px 10px rgba(0, 0, 0, 0.2)',
	'--shadow-theme-light-ambience-black-shadow-8-px':
		'0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 3px rgba(0, 0, 0, 0.12), 0px 4px 15px rgba(0, 0, 0, 0.2)',
	'--shadow-theme-light-ambience-black-shadow-16-px':
		'0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.2)',
	'--shadow-theme-light-ambience-black-shadow-24-px':
		'0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12), 0px 11px 15px rgba(0, 0, 0, 0.2)',
	'--color-base-purple-5': '#6c5ce7',
	'--color-base-purple-10': '#3e3871',
	'--color-base-purple-15': '#efedfc',
	'--color-base-purple-20': '#9387ed',
	'--color-base-purple-25': '#5d50bf',
	'--color-base-gray-5': '#edf1f7',
	'--color-base-gray-10': '#a9b6cb',
	'--color-base-gray-15': '#647696',
	'--color-base-gray-20': '#475161',
	'--color-base-gray-25': 'rgba(160, 174, 192, 0.5)',
	'--color-base-gray-30': '#f5f5f5',
	'--color-base-gray-35': '#c7d0e1',
	'--color-base-gray-40': '#dde3ee',
	'--color-base-green-5': '#007a52',
	'--color-base-green-10': '#00472f',
	'--color-base-green-15': '#f5fffc',
	'--color-base-orange-5': '#d62400',
	'--color-base-orange-10': '#701300',
	'--color-base-orange-15': '#ffeeeb',
	'--color-base-orange-20': '#eb5646',
	'--color-base-blue-5': '#00b9e0',
	'--color-base-blue-10': '#003b47',
	'--color-base-blue-15': '#f5fdff',
	'--color-base-yellow-5': '#ffae0a',
	'--color-base-yellow-10': '#704b00',
	'--color-base-yellow-15': '#fff8eb',
	'--color-base-black-5': '#222222',
	'--color-base-white-5': '#ffffff',
	'--color-base-white-10': '#f7f9fc',
	'--color-base-white-15': '#f5f5f5',
	'--color-base-white-20': '#f7f9fc',
	'--color-status-accents-poppy-r-600': '#a31b00',
	'--color-status-accents-mango-y-500': '#ffae0a',
	'--color-status-accents-spinach-g-800': '#007a52',
	'--color-status-accents-aqua-b-600': '#0469e3',
	'--color-maximum-blue-purple': '#ada4f4',
	'--color-accent-colors-purple-50': '#b6aef3',
	'--color-accent-colors-medium-orchid': '#bd59fa',
	'--color-accent-colors-maximum-blue-purple': '#000000',
	'--color-accent-colors-blue-chalk': '#edebff',
	'--color-accent-colors-pale-aqua': '#bad4fb',
	'--color-accent-colors-pastel-blue': '#43b7c2',
	'--color-accent-colors-bottle-green': '#003a25',
	'--color-accent-colors-aqua-deep': '#00593b',
	'--color-accent-colors-mint': '#47b0aa',
	'--color-accent-colors-summer-green': '#90bba5',
	'--color-accent-colors-bean': '#4f0800',
	'--color-accent-colors-rust-orange': '#ba5800',
	'--color-accent-colors-salmon-pink': '#e57872',
	'--color-accent-colors-crayola': '#ffce6c',
	'--color-accent-colors-sundown': '#fdafa3',
	'--color-accent-colors-butterscotch': '#ffad48',
	'--color-border-lighter': '#f5f5f5',
	'--color-border-light': '#a9b6cb',
	'--color-border-base': '#647696',
	'--color-border-dark': '#475161',
	'--color-border-link': '#6c5ce7',
	'--color-border-focus': '#edf1f7',
	'--color-border-warning': '#d62400',
	'--color-border-success': '#007a52',
	'--color-brand-primary-base': '#6c5ce7',
	'--color-brand-primary-medium': '#9387ed',
	'--color-brand-primary-dark': '#3e3871',
	'--color-brand-primary-darker': '#5d50bf',
	'--color-brand-primary-light': '#efedfc',
	'--color-brand-secondary-lightest': '#dde3ee',
	'--color-brand-secondary-lighter': '#edf1f7',
	'--color-brand-secondary-light': '#a9b6cb',
	'--color-brand-secondary-base': '#647696',
	'--color-brand-secondary-medium': '#c7d0e1',
	'--color-brand-secondary-dark': '#475161',
	'--color-brand-success-base': '#007a52',
	'--color-brand-success-dark': '#00472f',
	'--color-brand-success-light': '#f5fffc',
	'--color-brand-warning-base': '#d62400',
	'--color-brand-warning-dark': '#701300',
	'--color-brand-warning-light': '#ffeeeb',
	'--color-brand-warning-medium': '#eb5646',
	'--color-brand-attention-base': '#ffae0a',
	'--color-brand-attention-dark': '#704b00',
	'--color-brand-attention-light': '#fff8eb',
	'--color-brand-info-base': '#00b9e0',
	'--color-brand-info-dark': '#003b47',
	'--color-brand-info-light': '#f5fdff',
	'--color-brand-black-base': '#222222',
	'--color-brand-white-light': '#f7f9fc',
	'--color-brand-white-base': '#ffffff',
	'--color-brand-white-dark': '#f7f9fc',
	'--color-brand-white-darker': '#f5f5f5',
	'--color-bg-colors-lavender': '#f8f6ff',
	'--color-bg-colors-dolphin-grey-n-200': '#dde3ee',
	'--color-bg-colors-pure-white': '#ffffff',
	'--color-bg-colors-milkybar-white-n-5': '#f7f9fc',
	'--color-bg-colors-hibiscus-r-5': '#ffeeeb',
	'--color-bg-colors-cashew-y-5': '#fff8eb',
	'--color-bg-colors-algae-g-5': '#f5fffc',
	'--color-bg-colors-sky-b-5': '#f5fdff',
	'--color-bg-colors-tulip-purple-p-5': '#f9f8ff',
	'--color-bg-colors-lavender-b-5': '#fadeff',
	'--color-brand-colors-brand-orange': '#eb5646',
	'--color-brand-colors-orchid-purple-p-400-primary': '#6c5ce7',
	'--color-brand-colors-lavender-purple-p-500': '#5d50be',
	'--color-font-base': '#475161',
	'--color-font-secondary': '#647696',
	'--color-font-tertiary': '#a9b6cb',
	'--color-font-quaternary': '#edf1f7',
	'--color-font-link': '#6c5ce7',
	'--color-font-active': '#647696',
	'--color-font-warning': '#d62400',
	'--color-font-attention': '#ffae0a',
	'--color-font-success': '#007a52',
	'--color-font-info': '#00b9e0',
	'--color-font-disabled': 'rgba(160, 174, 192, 0.5)',
	'--color-font-white': '#ffffff',
	'--color-font-black': '#222222',
	'--color-font-text-tertiary-text-sonic-silver': '#767676',
	'--color-font-text-secondary-text-tarmac-grey-n-700': '#475161',
	'--color-font-text-primary-text-gray-900': '#212121',
	'--color-font-text-primary-text-jet-black': '#000000',
	'--color-font-text-primary-text-purple-gray': '#6e6b86',
	'--line-height-default': '1.5',
	'--line-height-condensed': '1.25',
	'--line-height-reset': '1',
	'--mq-large': ` only screen and (min-width":" 64.0625rem)`,
	/* Large form factor":" devices larger than tablet */
	'--mq-medium': ` only screen and (min-width":" 48rem)`,
	/* Medium form factor":" devices larger than phone */
	'--mq-small': ` only screen and (max-width":" 47.9375rem)`,
	/* Small form factor":" devices smaller than tablet */
	'--opacity-0': '0',
	'--opacity-1': '1',
	'--opacity-2': '0.2',
	'--opacity-4': '0.4',
	'--opacity-5': '0.5',
	'--opacity-8': '0.8',
	'--radii-2': '2px',
	'--radii-4': '4px',
	'--radii-6': '6px',
	'--radii-8': '8px',
	'--radii-10': '10px',
	'--radii-50': '50%',
	'--size-font-tiny': '0.6875rem',
	/* 11px */
	'--size-font-small': '0.75rem',
	/* 12px[Title 2] */
	'--size-font-medium': '0.8125rem',
	/* 13px */
	'--size-font-large': '0.875rem',
	/* 14px[Title 1] */
	'--size-font-xl': '1rem',
	/* 16px[H6] */
	'--size-font-2-xl': '1.125rem',
	/* 18px[H5] */
	'--size-font-3-xl': '1.375rem',
	/* 22px[H4] */
	'--size-font-4-xl': '1.875rem',
	/* 30px[H3] */
	'--size-font-5-xl': '2.25rem',
	/* 36px[H2] */
	'--size-font-6-xl': '2.625rem',
	/* 42px[H1] */
	'--size-font-v-2-small': '0.75rem',
	/* 12px[P3] */
	'--size-font-v-2-medium': '0.875rem',
	/* 14px[H3|P2] */
	'--size-font-v-2-large': '1rem',
	/* 16px[P1] */
	'--size-font-v-2-xl': '1.25rem',
	/* 20px[H2] */
	'--size-font-v-2-2-xl': '1.75rem',
	/* 28px[H1] */
	'--size-font-v-2-3-xl': '2.125rem',
	/* 34px[H0] */
	'--space-2': '0.125rem',
	/* 2px */
	'--space-4': '0.25rem',
	/* 4px */
	'--space-5': '0.3125rem',
	/* 5px */
	'--space-6': '0.375rem',
	/* 6px */
	'--space-8': '0.5rem',
	/* 8px */
	'--space-10': '0.625rem',
	/* 10px */
	'--space-12': '0.75rem',
	/* 12px */
	'--space-14': '0.875rem',
	/* 14px */
	'--space-15': '0.9375rem',
	/* 15px */
	'--space-16': '1rem',
	/* 16px */
	'--space-18': '1.125rem',
	/* 18px */
	'--space-20': '1.25rem',
	/* 20px */
	'--space-22': '1.375rem',
	/* 22px */
	'--space-24': '1.5rem',
	/* 24px */
	'--space-25': '1.5625rem',
	/* 25px */
	'--space-26': '1.625rem',
	/* 26px */
	'--space-28': '1.75rem',
	/* 28px */
	'--space-30': '1.875rem',
	/* 30px */
	'--space-32': '2rem',
	/* 32px */
	'--space-34': '2.125rem',
	/* 34px */
	'--space-35': '2.1875rem',
	/* 35px */
	'--space-36': '2.25rem',
	/* 36px */
	'--space-38': '2.375rem',
	/* 38px */
	'--space-40': '2.5rem',
	/* 40px */
	'--space-50': '3.125rem',
	/* 50px */
	'--space-60': '3.75rem',
	/* 60px */
	'--space-80': '5rem',
	/* 80px */
	'--space-100': '6.25rem',
	/* 100px */
	'--space-160': '10rem',
	/* 160px */
	'--space-0-01-em': '0.01em',
	/* 0.01em */
	'--space-0-02-em': '0.02em',
	/* 0.02em */
	'--font-base': '16',
	'--font-weight-regular': '400',
	'--font-weight-medium': '500',
	'--font-weight-semi-bold': '600',
	'--font-weight-bold': '700',
	'--font-weight-extra-bold': '800',
	'--font-family-primary': 'Inter',
	'--z-index-default': '0',
	'--z-index-negative': '-1',
	'--z-index-deepdive': '-99999',
} as const;

export default tokens;

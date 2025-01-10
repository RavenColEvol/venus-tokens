import { formatHex8 } from 'culori';
import tokens from './variables';

const categories = {
	shadow: {
		regex: /^--shadow/,
		properties: [/box-shadow/]
	},
	color: {
		regex: /^--color/,
		properties: [/color|background-color|border-color|outline-color|text-shadow|box-shadow|border-top-color|border-right-color|border-bottom-color|border-left-color|column-rule-color|text-decoration-color|fill|stroke/]
		// check if color are same as token then suggest
	},
	lineHeight: {
		regex: /^--line-height/,
		properties: [/line-height/]
	},
	mediaQuery: {
		regex: /^--mq/,
		properties: [/media/]
	},
	opacity: {
		regex: /^--opacity/,
		properties: [/opacity/]
	},
	radius: {
		regex: /^--radii/,
		properties: [/border-radius/]
	},
	fontSize: {
		regex: /^--(size-font|font-base)/,
		properties: [/font-size|font/]
		// convert px to rem and check equality with tokens
	},
	space: {
		regex: /^--space/,
		properties: [/padding|margin|gap|border|width|height|min-width|min-height|max-width|max-height|top|right|bottom|left|font-size|line-height|letter-spacing|border-width|border-radius|outline-width|box-shadow|text-indent|column-gap|column-width|grid-gap|grid-template-columns|grid-template-rows|grid-auto-columns|grid-auto-rows/],
		// convert px to rem and check equality with tokens
	},
	fontWeight: {
		regex: /^--font-weight/,
		properties: [/font-weight/]
		// convert bold semibold extra bold regular to tokens and check equality with tokens
	},
	fontFamily: {
		regex: /^--font-family/,
		properties: [/font-family|font/]
	},
	zIndex: {
		regex: /^--z-index/,
		properties: [/z-index/]
	}
} as const;

// collect all tokens based on regex
const tokensByCategory = new Map<string, Record<string, string>>();
Object.entries(tokens).forEach(([key, value]) => {
	for (const [category, { regex }] of Object.entries(categories)) {
		if (regex.test(key)) {
			if (!tokensByCategory.has(category)) {
				tokensByCategory.set(category, {});
			}
			tokensByCategory.get(category)![key] = value;
		}
	}
});

const compareTokenForCategory = (category: keyof typeof categories, value: string) => {
	const findToken = (value: string) => {
		for (const [key, token] of Object.entries(tokensByCategory.get(category)!)) {
			if (token === value) {
				return key;
			}
		}
		return null;
	};
	const findColor = (value: string) => {
		for (const [key, token] of Object.entries(tokensByCategory.get(category)!)) {
			if (formatHex8(token) === formatHex8(value)) {
				return key;
			}
		}
		return null;
	};
	const findPixelSize = (value: string) => {
		if (/rem/.test(value)) {
			const rem = parseFloat(value);
			return findToken(`${rem}rem`);
		}
		if (!/px/.test(value)) {
			return null;
		}
		const px = parseFloat(value);
		const rem = px / 16;
		const [whole, fraction] = rem.toString().split('.');
		if (!fraction) {
			return findToken(`${whole}rem`);
		}
		return findToken(`${whole + '.' + fraction.slice(0, 4)}rem`);
	};

	const findFontWeight = (value: string) => {
		const result = findToken(value);
		if (result) {
			return result;
		}
		const fontWeightMap: Record<string, string> = {
			'normal': '400',
			'bold': '700',
			'lighter': '300',
			'bolder': '800',
		};
		for(const [key, token] of Object.entries(tokensByCategory.get(category)!)) {
			if (token === fontWeightMap[value]) {
				return key;
			}
		}
	};
	switch(category) {
		case 'color':
			return findColor(value);
		case 'fontSize':
		case 'space':
			return findPixelSize(value);
		case 'fontWeight':
			return findFontWeight(value);
		default:
			return findToken(value);
	}
};

export {
	tokensByCategory,
	categories,
	compareTokenForCategory,
};
import { formatHex8 } from 'culori';
import tokens from './variables';

const NUMBER_REGEX = /\b\d+(\.\d+)?(px|rem)\b|\.\d+(px|rem)\b/g;
const COLOR_REGEX = 
			/#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)|(?<!var\()(\b(?:[\w-]+)\b)(?!\))/g;
const categories: Record<
	string,
	{
		regex: RegExp;
		properties: RegExp[];
		tokensRegex?: RegExp;
	}
> = {
	shadow: {
		regex: /^--shadow/,
		properties: [/(box-shadow):/],
	},
	color: {
		regex: /^--color/,
		properties: [
			/(color|background|background-color|border|border-color|outline-color|text-shadow|box-shadow|border-top-color|border-right-color|border-bottom-color|border-left-color|column-rule-color|text-decoration-color|fill|stroke):/,
		],
		tokensRegex: COLOR_REGEX,
		// check if color are same as token then suggest
	},
	lineHeight: {
		regex: /^--line-height/,
		properties: [/(line-height):/],
	},
	mediaQuery: {
		regex: /^--mq/,
		properties: [/media/],
	},
	opacity: {
		regex: /^--opacity/,
		properties: [/(opacity):/],
	},
	radius: {
		regex: /^--radii/,
		properties: [/(border-radius):/],
	},
	fontSize: {
		regex: /^--(size-font|font-base)/,
		properties: [/(font-size|font):/],
		tokensRegex: NUMBER_REGEX
	},
	space: {
		regex: /^--space/,
		properties: [
			/(padding|margin|gap|top|right|bottom|left|letter-spacing|text-indent|column-gap|column-width|grid-gap|grid-template-columns|grid-template-rows|grid-auto-columns|grid-auto-rows):/,
		],
		tokensRegex: NUMBER_REGEX
	},
	fontWeight: {
		regex: /^--font-weight/,
		properties: [/(font-weight):/],
	},
	fontFamily: {
		regex: /^--font-family/,
		properties: [/(font-family|font):/],
	},
	zIndex: {
		regex: /^--z-index/,
		properties: [/(z-index):/],
	},
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

const compareTokenForCategory = (
	category: keyof typeof categories,
	value: string
) => {
	const findToken = (value: string) => {
		for (const [key, token] of Object.entries(
			tokensByCategory.get(category)!
		)) {
			if (token === value) {
				return key;
			}
		}
		return null;
	};
	const findNumber = (value: string) => {
		const number = parseFloat(value);
		return findToken(number.toString());
	};
	const findColor = (value: string) => {
		for (const [key, token] of Object.entries(
			tokensByCategory.get(category)!
		)) {
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
			normal: '400',
			bold: '700',
			lighter: '300',
			bolder: '800',
		};
		for (const [key, token] of Object.entries(
			tokensByCategory.get(category)!
		)) {
			if (token === fontWeightMap[value]) {
				return key;
			}
		}
	};
	switch (category) {
		case 'color':
			return findColor(value);
		case 'fontSize':
		case 'space':
			return findPixelSize(value);
		case 'opacity':
			return findNumber(value);
		case 'fontWeight':
			return findFontWeight(value);
		default:
			return findToken(value);
	}
};

const getAllTokensForValue = (
	value: string,
	baseRes: RegExpExecArray,
	tokensRegex?: RegExp,
) => {
	if (!tokensRegex) {
		return [
			{
				value,
				startIdx: baseRes.index,
				endIdx: baseRes.index + baseRes[0].length,
			},
		];
	}
	const values = [];
	let m;
	while ((m = tokensRegex.exec(value))) {
		values.push({
			value: m[0],
			startIdx: baseRes.index + m.index,
			endIdx: baseRes.index + m.index + m[0].length,
		});
	}
	return values;
};

export {
	tokensByCategory,
	categories,
	compareTokenForCategory,
	getAllTokensForValue,
};

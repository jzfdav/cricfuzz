export const getLuminance = (hex: string) => {
	const c = hex.replace("#", "");
	const rgb = parseInt(c, 16);
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >> 8) & 0xff;
	const b = (rgb >> 0) & 0xff;
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const isDark = (hex?: string) => {
	if (!hex) return false;
	let targetHex = hex;
	if (hex.length === 4) {
		const r = hex[1];
		const g = hex[2];
		const b = hex[3];
		targetHex = `#${r}${r}${g}${g}${b}${b}`;
	}
	return getLuminance(targetHex) < 45;
};

export const getColorDistance = (c1: string, c2: string) => {
	const hexToRgb = (hex: string) => {
		const c = hex.replace("#", "");
		return {
			r: parseInt(c.substring(0, 2), 16),
			g: parseInt(c.substring(2, 4), 16),
			b: parseInt(c.substring(4, 6), 16),
		};
	};
	try {
		const rgb1 = hexToRgb(c1);
		const rgb2 = hexToRgb(c2);
		return Math.sqrt(
			(rgb1.r - rgb2.r) ** 2 + (rgb1.g - rgb2.g) ** 2 + (rgb1.b - rgb2.b) ** 2,
		);
	} catch (_e) {
		return 500;
	}
};

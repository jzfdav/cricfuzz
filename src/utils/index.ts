export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function getTeamFlag(teamId: string): string {
	const map: Record<string, string> = {
		ind: "🇮🇳",
		aus: "🇦🇺",
		eng: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
		afg: "🇦🇫",
		ban: "🇧🇩",
		ire: "🇮🇪",
		nz: "🇳🇿",
		sl: "🇱🇰",
		wi: "🌴",
		zim: "🇿🇼",
		sa: "🇿🇦",
		pak: "🇵🇰",
	};
	return map[teamId.toLowerCase()] || "🏳️";
}

export function getLuminance(hex: string): number {
	const c = hex.substring(1); // strip #
	const rgb = parseInt(c, 16); // convert rrggbb to decimal
	const r = (rgb >> 16) & 0xff; // extract red
	const g = (rgb >> 8) & 0xff; // extract green
	const b = (rgb >> 0) & 0xff; // extract blue

	// heavy-handed luminance (YIQ approximate)
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDarkColor(hex: string): boolean {
	if (!hex) return false;
	return getLuminance(hex) < 40; // Threshold for "Too Dark for Dark Mode"
}

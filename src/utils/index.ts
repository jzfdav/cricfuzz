export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function getTeamFlag(teamId: string): string {
    const map: Record<string, string> = {
        'ind': '🇮🇳', 'aus': '🇦🇺', 'eng': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'afg': '🇦🇫', 'ban': '🇧🇩', 'ire': '🇮🇪',
        'nz': '🇳🇿', 'sl': '🇱🇰', 'wi': '🌴',
        'zim': '🇿🇼', 'sa': '🇿🇦', 'pak': '🇵🇰'
    };
    return map[teamId.toLowerCase()] || '🏳️';
}

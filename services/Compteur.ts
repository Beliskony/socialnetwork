export function formatCount(count: number): string {
    if (count >= 1_000_000) {
        return (count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1) + 'M';
    }
    if (count >= 1_000) {
        return (count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1) + 'k';
    }
    return count.toString();
}
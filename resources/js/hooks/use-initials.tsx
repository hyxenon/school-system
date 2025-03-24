export function getInitials(name: string | null | undefined): string {
    if (!name) return '';

    return name
        .trim()
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

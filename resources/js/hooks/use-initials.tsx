export function getInitials(name: string | null | undefined): string {
    if (!name) return '';

    return name
        .trim()
        .split(' ')
        .map((word) => word[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function useInitials(name: string | null | undefined) {
    return () => getInitials(name);
}

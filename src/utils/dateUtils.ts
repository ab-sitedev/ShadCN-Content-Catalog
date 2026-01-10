export function parseLocalDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function getRelativeTime(dateString: string) {
    const contentDate = parseLocalDate(dateString);
    const now = new Date();

    const diffMs = now.getTime() - contentDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60)
        return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffWeeks < 5)
        return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
        return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;

    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}

export function isRecent(dateString: string, days = 3) {
    const contentDate = parseLocalDate(dateString);
    const now = new Date();
    const diffMs = now.getTime() - contentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= days;
}
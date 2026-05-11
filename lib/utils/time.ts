export const getRelativeDate = (date: Date | number, locale = 'en') => {
    const now = Date.now();
    const diffMs = date instanceof Date ? date.getTime() - now : date - now;
    const diffSec = diffMs / 1000;
    const absSec = Math.abs(diffSec);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const units: { unit: Intl.RelativeTimeFormatUnit; limit: number; seconds: number; }[] = [
        { unit: 'second', limit: 60, seconds: 1 },
        { unit: 'minute', limit: 60 * 60, seconds: 60 },
        { unit: 'hour', limit: 24 * 60 * 60, seconds: 60 * 60 },
        { unit: 'day', limit: 30 * 24 * 60 * 60, seconds: 24 * 60 * 60 },
        { unit: 'month', limit: 365 * 24 * 60 * 60, seconds: 30 * 24 * 60 * 60 },
        { unit: 'year', limit: Infinity, seconds: 365 * 24 * 60 * 60 },
    ];

    for (const { unit, limit, seconds } of units) {
        if (absSec < limit) {
            const value = Math.round(diffSec / seconds);
            return rtf.format(value, unit);
        }
    }

    return '';
};

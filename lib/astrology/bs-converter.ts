/**
 * Bikram Sambat (BS/Nepali Calendar) ↔ Gregorian (AD) Date Utilities
 * Uses the `nepali-date-converter` npm package for accuracy.
 */

// nepali-date-converter uses 0-based months (0=Baishakh, 11=Chaitra)
// BS year range: 2000–2090

import NepaliDate from 'nepali-date-converter';

export const BS_MONTH_NAMES = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export const BS_MIN_YEAR = 1000;
export const BS_MAX_YEAR = 3000;

// Approximate month lengths for fallback calculations
const FALLBACK_MONTH_DAYS = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];

/**
 * Convert a BS date to an AD Date object.
 * @param bsYear  Bikram Sambat year (e.g. 2082)
 * @param bsMonth 1-indexed month (1=Baishakh … 12=Chaitra)
 * @param bsDay   Day of month (1-based)
 */
export function bsToAdDate(bsYear: number, bsMonth: number, bsDay: number): Date {
    try {
        // nepali-date-converter expects 0-based month
        const nd = new NepaliDate(bsYear, bsMonth - 1, bsDay);
        return nd.toJsDate();
    } catch (e) {
        // Fallback for years outside 2000-2090
        // Baishakh 1 is usually around April 14
        const adYear = bsYear - 57;
        
        let daysFromBaishakh1 = bsDay - 1;
        for (let i = 0; i < bsMonth - 1; i++) {
            daysFromBaishakh1 += FALLBACK_MONTH_DAYS[i];
        }

        const baseDate = new Date(adYear, 3, 14); // April 14
        baseDate.setDate(baseDate.getDate() + daysFromBaishakh1);
        return baseDate;
    }
}

/**
 * Convert a BS date to a YYYY-MM-DD string (for <input type="date">).
 */
export function bsToAdString(bsYear: number, bsMonth: number, bsDay: number): string {
    const d = bsToAdDate(bsYear, bsMonth, bsDay);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the number of days in a given BS month/year.
 */
export function getBsMonthDays(bsYear: number, bsMonth: number): number {
    try {
        // Get day 1 of the given month and day 1 of the next month, diff them
        const firstDay = new NepaliDate(bsYear, bsMonth - 1, 1).toJsDate();
        let nextYear = bsYear;
        let nextMonth = bsMonth; // 1-based
        if (nextMonth === 12) { nextYear++; nextMonth = 1; } else { nextMonth++; }
        const firstDayNext = new NepaliDate(nextYear, nextMonth - 1, 1).toJsDate();
        return Math.round((firstDayNext.getTime() - firstDay.getTime()) / 86_400_000);
    } catch {
        return FALLBACK_MONTH_DAYS[bsMonth - 1] || 30; // fallback
    }
}

/**
 * Returns the current BS year (approximate, based on current AD date).
 */
export function getCurrentBsYear(): number {
    const now = new Date();
    return now.getFullYear() + 56; // rough estimate
}

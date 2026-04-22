/** Rating bands used to classify problems (e.g. CF-style). */
export const RATING_RANGES = {
    Easy: [800, 1200],
    Medium: [1300, 1700],
    Hard: [1800, 3000],
};

export const DIFFICULTY_LABELS = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
};

const DEFAULT_PROBLEMS_COUNT = {
    Easy: 100,
    Medium: 100,
    Hard: 100,
};

/**
 * Hardcoded problem counts by difficulty for the dashboard until live data is wired.
 * Adjust these numbers to match your catalog.
 */
export const HARDCODED_PROBLEM_COUNTS = {
    easy: DEFAULT_PROBLEMS_COUNT.Easy,
    medium: DEFAULT_PROBLEMS_COUNT.Medium,
    hard: DEFAULT_PROBLEMS_COUNT.Hard,
};

/**
 * Returns total problems, per-difficulty counts, and bar percentages (0–100).
 */
export function getDashboardProblemStats() {
    const { easy, medium, hard } = HARDCODED_PROBLEM_COUNTS;
    const total = easy + medium + hard;
    if (!total) {
        return {
            counts: { easy: 0, medium: 0, hard: 0 },
            total: 0,
            percentages: { easy: 0, medium: 0, hard: 0 },
        };
    }
    return {
        counts: { easy, medium, hard },
        total,
        percentages: {
            easy: Math.round((easy / total) * 100),
            medium: Math.round((medium / total) * 100),
            hard: Math.round((hard / total) * 100),
        },
    };
}

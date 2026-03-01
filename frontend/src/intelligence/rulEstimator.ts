// ────────────────────────────────────────────
// RUL Estimator — Linear Regression on health scores
// Projects "time to failure" per subsystem
// ────────────────────────────────────────────

export interface RulEstimate {
    subsystem: string;
    currentScore: number;
    slope: number; // per tick (2 seconds)
    ticksToFailure: number;
    secondsToFailure: number;
    daysToFailure: number;
    status: 'stable' | 'degrading' | 'critical';
}

// Rolling subsystem score history
const scoreHistory: Record<string, number[]> = {};
const MAX_HISTORY = 60; // 60 ticks = 2 minutes

export function recordSubsystemScore(subsystem: string, score: number) {
    if (!scoreHistory[subsystem]) scoreHistory[subsystem] = [];
    scoreHistory[subsystem].push(score);
    if (scoreHistory[subsystem].length > MAX_HISTORY) scoreHistory[subsystem].shift();
}

/**
 * Simple linear regression: y = mx + b
 * Returns slope m and intercept b.
 */
function linearRegression(y: number[]): { slope: number; intercept: number } {
    const n = y.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
    const sumXX = x.reduce((a, xi) => a + xi * xi, 0);

    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 0.001) return { slope: 0, intercept: sumY / n };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

/**
 * Estimate remaining useful life for all subsystems.
 * Uses linear regression on recent health score history.
 */
export function estimateRUL(subsystemScores: Record<string, number>): RulEstimate[] {
    const results: RulEstimate[] = [];

    for (const [sys, score] of Object.entries(subsystemScores)) {
        recordSubsystemScore(sys, score);

        const hist = scoreHistory[sys];
        if (!hist || hist.length < 10) {
            results.push({
                subsystem: sys,
                currentScore: score,
                slope: 0,
                ticksToFailure: -1,
                secondsToFailure: -1,
                daysToFailure: -1,
                status: 'stable',
            });
            continue;
        }

        const { slope } = linearRegression(hist);
        const FAILURE_THRESHOLD = 25; // Below 25 = "Failure Imminent"

        let ticksToFailure = -1;
        let status: RulEstimate['status'] = 'stable';

        if (slope < -0.05) {
            // Degrading
            status = 'degrading';
            if (score > FAILURE_THRESHOLD) {
                ticksToFailure = Math.max(0, (score - FAILURE_THRESHOLD) / Math.abs(slope));
            } else {
                ticksToFailure = 0;
                status = 'critical';
            }
        } else if (score < FAILURE_THRESHOLD) {
            ticksToFailure = 0;
            status = 'critical';
        }

        const secondsToFailure = ticksToFailure >= 0 ? ticksToFailure * 2 : -1;
        const daysToFailure = secondsToFailure >= 0 ? secondsToFailure / 86400 : -1;

        results.push({
            subsystem: sys,
            currentScore: score,
            slope: Math.round(slope * 1000) / 1000,
            ticksToFailure: Math.round(ticksToFailure),
            secondsToFailure: Math.round(secondsToFailure),
            daysToFailure: Math.round(daysToFailure * 10) / 10,
            status,
        });
    }

    return results;
}

/**
 * Generate projected future scores for charting (dotted line).
 * Returns array of projected scores for the next N ticks.
 */
export function projectFuture(subsystem: string, ticks: number = 15): number[] {
    const hist = scoreHistory[subsystem];
    if (!hist || hist.length < 5) return [];

    const { slope, intercept } = linearRegression(hist);
    const start = hist.length;

    return Array.from({ length: ticks }, (_, i) => {
        const projected = slope * (start + i) + intercept;
        return Math.max(0, Math.min(100, Math.round(projected)));
    });
}

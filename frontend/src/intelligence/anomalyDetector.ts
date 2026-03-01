// ────────────────────────────────────────────
// Anomaly Detector — Z-Score with 30-sample rolling window
// ────────────────────────────────────────────

export interface Anomaly {
    param: string;
    label: string;
    zScore: number;
    value: number;
    mean: number;
    severity: 'moderate' | 'severe' | 'extreme';
}

const HISTORY_SIZE = 30;

// Module-level rolling history
const history: Record<string, number[]> = {};

export function recordSample(param: string, value: number) {
    if (!history[param]) history[param] = [];
    history[param].push(value);
    if (history[param].length > HISTORY_SIZE) history[param].shift();
}

export function getHistory(param: string): number[] {
    return history[param] || [];
}

export function clearHistory() {
    for (const key of Object.keys(history)) {
        delete history[key];
    }
}

function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
    const m = mean(arr);
    const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Detect anomalies using Z-Score analysis.
 * Requires at least 10 historical samples.
 */
export function detectAnomalies(
    state: Record<string, number>,
    configs: Record<string, { label: string }>,
    zsThreshold = 3.0
): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const [param, value] of Object.entries(state)) {
        // Record the new sample
        recordSample(param, value);

        const hist = history[param];
        if (!hist || hist.length < 10) continue;

        // Use all samples except the most recent for baseline
        const baseline = hist.slice(0, -1);
        const m = mean(baseline);
        const sd = stdDev(baseline);

        if (sd < 0.001) continue; // Skip near-constant params

        const zScore = (value - m) / sd;
        const absZ = Math.abs(zScore);

        if (absZ > zsThreshold) {
            let severity: Anomaly['severity'] = 'moderate';
            if (absZ > 5.0) severity = 'extreme';
            else if (absZ > 4.0) severity = 'severe';

            anomalies.push({
                param,
                label: configs[param]?.label || param,
                zScore: Math.round(zScore * 100) / 100,
                value,
                mean: Math.round(m * 100) / 100,
                severity,
            });
        }
    }

    return anomalies;
}

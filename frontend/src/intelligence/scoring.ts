// ────────────────────────────────────────────
// Health Scoring System
// Converts raw values → 0-100 scores using threshold configs
// ────────────────────────────────────────────

export interface ParamConfig {
    subsystem: string;
    unit: string;
    label: string;
    min: number;
    max: number;
    optMin: number;
    optMax: number;
    critBelow: number;
    critAbove: number;
}

export interface ScoringResult {
    paramScores: Record<string, number>;
    subsystemScores: Record<string, number>;
    overallScore: number;
    tier: string;
    tierColor: string;
}

const TIER_MAP = [
    { min: 85, label: 'Optimal', color: '#22c55e', dot: 'green' },
    { min: 70, label: 'Good', color: '#3478F6', dot: 'blue' },
    { min: 50, label: 'Caution', color: '#F5A623', dot: 'orange' },
    { min: 25, label: 'Critical', color: '#ef4444', dot: 'red' },
    { min: 0, label: 'Failure Imminent', color: '#7f1d1d', dot: 'red' },
];

export function getTier(score: number) {
    for (const t of TIER_MAP) {
        if (score >= t.min) return t;
    }
    return TIER_MAP[TIER_MAP.length - 1];
}

/**
 * Score a single parameter value against its config.
 * Returns 0-100 where 100 = perfectly within optimal range.
 */
export function scoreParameter(value: number, config: ParamConfig): number {
    const { optMin, optMax, critBelow, critAbove, min: absMin, max: absMax } = config;

    // Within optimal range → 100
    if (value >= optMin && value <= optMax) return 100;

    // Below optimal
    if (value < optMin) {
        if (value <= critBelow) {
            // Below critical → map [absMin, critBelow] to [0, 15]
            const range = critBelow - absMin;
            if (range <= 0) return 0;
            return Math.max(0, ((value - absMin) / range) * 15);
        }
        // Between critBelow and optMin → map to [15, 85]
        const range = optMin - critBelow;
        if (range <= 0) return 50;
        return 15 + ((value - critBelow) / range) * 70;
    }

    // Above optimal
    if (value > optMax) {
        if (value >= critAbove) {
            // Above critical → map [critAbove, absMax] to [15, 0]
            const range = absMax - critAbove;
            if (range <= 0) return 0;
            return Math.max(0, 15 - ((value - critAbove) / range) * 15);
        }
        // Between optMax and critAbove → map to [85, 15]
        const range = critAbove - optMax;
        if (range <= 0) return 50;
        return 85 - ((value - optMax) / range) * 70;
    }

    return 50;
}

/**
 * Score all parameters, subsystems, and compute weighted overall.
 */
export function computeScores(
    state: Record<string, number>,
    configs: Record<string, ParamConfig>,
    subsystemWeights: Record<string, number>
): ScoringResult {
    // 1. Score each parameter
    const paramScores: Record<string, number> = {};
    for (const [key, value] of Object.entries(state)) {
        const cfg = configs[key];
        if (cfg) {
            paramScores[key] = Math.round(scoreParameter(value, cfg));
        }
    }

    // 2. Score each subsystem (average of its params)
    const subsystemScores: Record<string, number> = {};
    const subsystemParams: Record<string, number[]> = {};

    for (const [key, score] of Object.entries(paramScores)) {
        const cfg = configs[key];
        if (cfg) {
            if (!subsystemParams[cfg.subsystem]) subsystemParams[cfg.subsystem] = [];
            subsystemParams[cfg.subsystem].push(score);
        }
    }

    for (const [sys, scores] of Object.entries(subsystemParams)) {
        subsystemScores[sys] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // 3. Weighted overall score
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [sys, score] of Object.entries(subsystemScores)) {
        const w = subsystemWeights[sys] || 1.0;
        weightedSum += score * w;
        totalWeight += w;
    }
    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // 4. Tier classification
    const tier = getTier(overallScore);

    return {
        paramScores,
        subsystemScores,
        overallScore,
        tier: tier.label,
        tierColor: tier.color,
    };
}

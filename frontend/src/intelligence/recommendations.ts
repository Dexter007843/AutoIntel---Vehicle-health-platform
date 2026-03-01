// ────────────────────────────────────────────
// AI Recommendations Engine
// Identifies weakest subsystem → generates suggestions
// ────────────────────────────────────────────

import type { RulEstimate } from './rulEstimator';

export interface Recommendation {
    subsystem: string;
    score: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    detail: string;
    estimatedCost: string;
    timeline: string;
}

const REPAIR_DATABASE: Record<string, { action: string; detail: string; cost: string }> = {
    engine: { action: 'Engine Service', detail: 'Oil change, filter replacement, coolant flush', cost: '₹3,000 – ₹5,000' },
    brakes: { action: 'Brake System Overhaul', detail: 'Pad replacement, fluid top-up, disc inspection', cost: '₹2,500 – ₹8,000' },
    transmission: { action: 'Transmission Service', detail: 'Fluid change, torque converter check', cost: '₹4,000 – ₹12,000' },
    electrical: { action: 'Electrical Diagnostics', detail: 'Battery test, alternator check, wiring inspection', cost: '₹1,000 – ₹3,000' },
    tyres: { action: 'Tyre Service', detail: 'Pressure correction, rotation, alignment check', cost: '₹500 – ₹6,000' },
    emissions: { action: 'Emissions Check', detail: 'Catalytic converter inspection, sensor calibration', cost: '₹2,000 – ₹7,000' },
    ev_battery: { action: 'EV Battery Diagnostics', detail: 'Cell balancing, thermal management check, BMS update', cost: '₹5,000 – ₹25,000' },
};

export function generateRecommendations(
    subsystemScores: Record<string, number>,
    rulEstimates: RulEstimate[]
): Recommendation[] {
    const recs: Recommendation[] = [];

    // Sort subsystems by score (worst first)
    const sorted = Object.entries(subsystemScores).sort((a, b) => a[1] - b[1]);

    for (const [sys, score] of sorted) {
        if (score >= 85) continue; // Skip healthy systems

        const rul = rulEstimates.find(r => r.subsystem === sys);
        const repair = REPAIR_DATABASE[sys] || { action: 'Inspection Required', detail: 'Schedule diagnostic', cost: '₹1,000+' };

        let urgency: Recommendation['urgency'] = 'low';
        let timeline = 'Schedule at next service';

        if (score < 25) {
            urgency = 'critical';
            timeline = 'IMMEDIATELY — Do not drive!';
        } else if (score < 50) {
            urgency = 'high';
            timeline = 'Within 24 hours';
        } else if (score < 70) {
            urgency = 'medium';
            timeline = 'Within 1 week';
        }

        // Override timeline with RUL if available
        if (rul && rul.daysToFailure >= 0 && rul.daysToFailure < 7) {
            if (rul.daysToFailure < 1) {
                timeline = `URGENT: ~${Math.round(rul.secondsToFailure / 60)} minutes to failure`;
                urgency = 'critical';
            } else {
                timeline = `~${rul.daysToFailure} days to failure`;
                if (urgency !== 'critical') urgency = 'high';
            }
        }

        recs.push({
            subsystem: sys,
            score,
            urgency,
            action: repair.action,
            detail: repair.detail,
            estimatedCost: repair.cost,
            timeline,
        });
    }

    return recs;
}

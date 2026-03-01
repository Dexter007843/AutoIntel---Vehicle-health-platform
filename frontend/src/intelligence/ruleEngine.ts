// ────────────────────────────────────────────
// Rule Engine — Hard threshold rules + compound rules
// ────────────────────────────────────────────

import type { ParamConfig } from './scoring';

export interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'critical' | 'danger';
    param: string;
    label: string;
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
}

// Hard rules table
const HARD_RULES: Array<{
    param: string;
    condition: 'above' | 'below';
    threshold: number;
    severity: Alert['severity'];
    message: string;
}> = [
        { param: 'coolant_temp', condition: 'above', threshold: 115, severity: 'danger', message: 'CRITICAL: Coolant temperature dangerously high!' },
        { param: 'coolant_temp', condition: 'above', threshold: 100, severity: 'warning', message: 'Coolant temperature elevated' },
        { param: 'rpm', condition: 'above', threshold: 5500, severity: 'warning', message: 'Engine RPM very high — risk of damage' },
        { param: 'oil_pressure', condition: 'below', threshold: 18, severity: 'critical', message: 'Oil pressure critically low!' },
        { param: 'oil_life', condition: 'below', threshold: 12, severity: 'warning', message: 'Oil change overdue' },
        { param: 'brake_pad_wear', condition: 'below', threshold: 15, severity: 'danger', message: 'BRAKE PADS WORN — Replace immediately!' },
        { param: 'brake_pad_wear', condition: 'below', threshold: 30, severity: 'warning', message: 'Brake pads wearing thin' },
        { param: 'brake_fluid', condition: 'below', threshold: 40, severity: 'critical', message: 'Brake fluid critically low!' },
        { param: 'brake_disc_temp', condition: 'above', threshold: 350, severity: 'danger', message: 'Brake disc overheating!' },
        { param: 'battery_voltage', condition: 'below', threshold: 10.5, severity: 'critical', message: 'Battery voltage critical — risk of stall' },
        { param: 'battery_voltage', condition: 'below', threshold: 11.8, severity: 'warning', message: 'Battery voltage low' },
        { param: 'battery_soc', condition: 'below', threshold: 15, severity: 'danger', message: 'EV Battery critically low!' },
        { param: 'battery_soc', condition: 'below', threshold: 25, severity: 'warning', message: 'EV Battery running low' },
        { param: 'cell_voltage_delta', condition: 'above', threshold: 0.2, severity: 'critical', message: 'Cell voltage imbalance detected!' },
        { param: 'inverter_temp', condition: 'above', threshold: 85, severity: 'warning', message: 'Inverter running hot' },
        { param: 'motor_temp', condition: 'above', threshold: 100, severity: 'danger', message: 'Motor overheating!' },
        { param: 'trans_temp', condition: 'above', threshold: 125, severity: 'critical', message: 'Transmission overheating!' },
        { param: 'trans_slip', condition: 'above', threshold: 6, severity: 'warning', message: 'High transmission slip detected' },
        { param: 'co2_level', condition: 'above', threshold: 240, severity: 'warning', message: 'High CO2 emissions!' },
        { param: 'exhaust_temp', condition: 'above', threshold: 650, severity: 'critical', message: 'Exhaust temperature dangerously high!' },
        { param: 'tyre_pressure_fl', condition: 'below', threshold: 24, severity: 'critical', message: 'Front-left tyre pressure critically low!' },
        { param: 'tyre_pressure_fr', condition: 'below', threshold: 24, severity: 'critical', message: 'Front-right tyre pressure critically low!' },
        { param: 'tyre_pressure_rl', condition: 'below', threshold: 24, severity: 'critical', message: 'Rear-left tyre pressure critically low!' },
        { param: 'tyre_pressure_rr', condition: 'below', threshold: 24, severity: 'critical', message: 'Rear-right tyre pressure critically low!' },
    ];

// Compound rules
interface CompoundRule {
    conditions: Array<{ param: string; condition: 'above' | 'below'; threshold: number }>;
    severity: Alert['severity'];
    message: string;
}

const COMPOUND_RULES: CompoundRule[] = [
    {
        conditions: [
            { param: 'rpm', condition: 'above', threshold: 4000 },
            { param: 'oil_pressure', condition: 'below', threshold: 20 },
        ],
        severity: 'danger',
        message: 'COMPOUND: High RPM + Low Oil Pressure — ENGINE SEIZURE RISK!',
    },
    {
        conditions: [
            { param: 'coolant_temp', condition: 'above', threshold: 105 },
            { param: 'brake_disc_temp', condition: 'above', threshold: 250 },
        ],
        severity: 'danger',
        message: 'COMPOUND: Overheating engine + hot brakes — PULL OVER NOW!',
    },
    {
        conditions: [
            { param: 'brake_pad_wear', condition: 'below', threshold: 25 },
            { param: 'brake_fluid', condition: 'below', threshold: 50 },
        ],
        severity: 'danger',
        message: 'COMPOUND: Worn brake pads + low fluid — BRAKING FAILURE RISK!',
    },
];

let alertCounter = 0;

export function runRuleEngine(
    state: Record<string, number>,
    configs: Record<string, ParamConfig>
): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now() / 1000;

    // Check hard rules
    for (const rule of HARD_RULES) {
        const val = state[rule.param];
        if (val === undefined) continue;

        let triggered = false;
        if (rule.condition === 'above' && val > rule.threshold) triggered = true;
        if (rule.condition === 'below' && val < rule.threshold) triggered = true;

        if (triggered) {
            const cfg = configs[rule.param];
            alerts.push({
                id: `rule-${++alertCounter}`,
                severity: rule.severity,
                param: rule.param,
                label: cfg?.label || rule.param,
                message: rule.message,
                value: val,
                threshold: rule.threshold,
                timestamp: now,
            });
        }
    }

    // Check compound rules
    for (const cr of COMPOUND_RULES) {
        const allMet = cr.conditions.every(c => {
            const val = state[c.param];
            if (val === undefined) return false;
            if (c.condition === 'above') return val > c.threshold;
            return val < c.threshold;
        });

        if (allMet) {
            alerts.push({
                id: `compound-${++alertCounter}`,
                severity: cr.severity,
                param: 'compound',
                label: 'Compound Alert',
                message: cr.message,
                value: 0,
                threshold: 0,
                timestamp: now,
            });
        }
    }

    return alerts;
}

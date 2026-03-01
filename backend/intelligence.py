import numpy as np
from typing import Dict, Any, List
import math


class HealthIntelligence:
    """Advanced vehicle health scoring with adaptive thresholds,
    modified z-scores, Holt-Winters RUL, and compound failure detection."""

    def __init__(self):
        self.history: Dict[str, List[float]] = {}
        self.max_history = 120
        # Holt-Winters state per parameter
        self.hw_level: Dict[str, float] = {}
        self.hw_trend: Dict[str, float] = {}

    # --- Adaptive threshold ranges based on RPM/load ---
    ADAPTIVE_THRESHOLDS = {
        "engine_temp": {"base_max": 95, "rpm_factor": 0.005, "critical_max": 120},
        "trans_temp":  {"base_max": 95, "rpm_factor": 0.004, "critical_max": 130},
        "brake_wear":  {"critical_min": 20},
        "tyre_pressure": {"normal_min": 28, "normal_max": 36, "critical_min": 22, "critical_max": 42},
        "battery_voltage": {"normal_min": 12.0, "normal_max": 13.0, "critical_min": 10.5},
        "oil_life": {"critical_min": 10},
    }

    def _record(self, key: str, value: float):
        if key not in self.history:
            self.history[key] = []
        self.history[key].append(value)
        if len(self.history[key]) > self.max_history:
            self.history[key].pop(0)

    def _modified_z_score(self, key: str, value: float) -> float:
        """Uses median absolute deviation for robustness"""
        if key not in self.history or len(self.history[key]) < 10:
            return 0.0
        data = np.array(self.history[key][:-1])
        median = np.median(data)
        mad = np.median(np.abs(data - median))
        if mad == 0:
            return 0.0
        return 0.6745 * (value - median) / mad

    def _holt_winters_forecast(self, key: str, value: float, alpha=0.3, beta=0.1) -> float:
        """Simple double exponential smoothing for trend estimation.
        Returns estimated ticks until critical threshold."""
        if key not in self.hw_level:
            self.hw_level[key] = value
            self.hw_trend[key] = 0.0
            return -1.0

        prev_level = self.hw_level[key]
        prev_trend = self.hw_trend[key]

        self.hw_level[key] = alpha * value + (1 - alpha) * (prev_level + prev_trend)
        self.hw_trend[key] = beta * (self.hw_level[key] - prev_level) + (1 - beta) * prev_trend

        trend = self.hw_trend[key]
        current = self.hw_level[key]

        thresholds = self.ADAPTIVE_THRESHOLDS.get(key, {})

        # Determine critical boundary
        if trend < -0.001:  # Decreasing
            critical = thresholds.get("critical_min", 0)
            if current > critical:
                ticks = (current - critical) / abs(trend)
                return ticks * 2.0  # Convert to seconds (2s ticks)
        elif trend > 0.001:  # Increasing
            critical = thresholds.get("critical_max", 999)
            if current < critical:
                ticks = (critical - current) / trend
                return ticks * 2.0

        return -1.0  # Stable

    def score_parameter(self, key: str, value: float, rpm: float = 800) -> float:
        """Score a single parameter 0-100 (100 = perfect health)."""
        thresholds = self.ADAPTIVE_THRESHOLDS.get(key, {})

        if key in ("engine_temp", "trans_temp"):
            # Adaptive max: higher RPM allows higher temp
            adj_max = thresholds.get("base_max", 95) + (rpm - 800) * thresholds.get("rpm_factor", 0.005)
            adj_max = min(adj_max, thresholds.get("critical_max", 120))
            normal_min = 75
            critical_max = thresholds.get("critical_max", 120)

            if value <= adj_max and value >= normal_min:
                return 100.0
            elif value > adj_max:
                excess = (value - adj_max) / (critical_max - adj_max)
                return max(0, 100 - excess * 100)
            else:
                deficit = (normal_min - value) / (normal_min - 20)
                return max(30, 100 - deficit * 40)

        elif key == "brake_wear":
            critical = thresholds.get("critical_min", 20)
            if value >= 80:
                return 100.0
            elif value >= 50:
                return 60 + (value - 50) / 30 * 40
            elif value >= critical:
                return 20 + (value - critical) / 30 * 40
            else:
                return max(0, value / critical * 20)

        elif key == "tyre_pressure":
            nmin = thresholds.get("normal_min", 28)
            nmax = thresholds.get("normal_max", 36)
            cmin = thresholds.get("critical_min", 22)
            cmax = thresholds.get("critical_max", 42)
            if nmin <= value <= nmax:
                return 100.0
            elif value < nmin:
                if value >= cmin:
                    return 40 + (value - cmin) / (nmin - cmin) * 60
                else:
                    return max(0, value / cmin * 40)
            else:
                if value <= cmax:
                    return 40 + (cmax - value) / (cmax - nmax) * 60
                else:
                    return 0.0

        elif key == "battery_voltage":
            nmin = thresholds.get("normal_min", 12.0)
            nmax = thresholds.get("normal_max", 13.0)
            cmin = thresholds.get("critical_min", 10.5)
            if nmin <= value <= nmax:
                return 100.0
            elif value < nmin:
                if value >= cmin:
                    return 30 + (value - cmin) / (nmin - cmin) * 70
                else:
                    return max(0, value / cmin * 30)
            else:
                return max(60, 100 - (value - nmax) * 10)

        elif key == "oil_life":
            critical = thresholds.get("critical_min", 10)
            if value >= 50:
                return 100.0
            elif value >= 20:
                return 50 + (value - 20) / 30 * 50
            elif value >= critical:
                return 15 + (value - critical) / 10 * 35
            else:
                return max(0, value / critical * 15)

        return 80.0  # Unknown param default

    def compute_health(self, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compute comprehensive health analysis for a vehicle."""
        state = vehicle_data["state"]
        rpm = vehicle_data.get("rpm", 800)

        # Record history
        for k, v in state.items():
            self._record(k, v)

        # Score each parameter
        param_scores = {}
        for k, v in state.items():
            param_scores[k] = round(self.score_parameter(k, v, rpm), 1)

        # Weighted overall health
        weights = {
            "engine_temp": 0.20,
            "brake_wear": 0.20,
            "tyre_pressure": 0.18,
            "battery_voltage": 0.12,
            "oil_life": 0.15,
            "trans_temp": 0.15,
        }
        total_weight = sum(weights.get(k, 0.1) for k in state.keys())
        overall = sum(param_scores.get(k, 80) * weights.get(k, 0.1) for k in state.keys()) / total_weight
        overall = round(max(0, min(100, overall)), 1)

        # Anomaly detection (Modified Z-Score)
        anomalies = []
        for k, v in state.items():
            z = self._modified_z_score(k, v)
            if abs(z) > 3.5:
                anomalies.append({"param": k, "z_score": round(z, 2), "value": v})

        # RUL estimation (Holt-Winters)
        rul = {}
        for k, v in state.items():
            r = self._holt_winters_forecast(k, v)
            if r >= 0:
                rul[k] = round(r, 1)

        # Compound failure detection
        compound_alerts = []
        if state.get("tyre_pressure", 32) < 25 and state.get("engine_temp", 90) > 100:
            compound_alerts.append("CRITICAL: Low Tyre Pressure + High Engine Temp — Immediate Danger")
        if state.get("brake_wear", 80) < 30 and state.get("oil_life", 50) < 15:
            compound_alerts.append("WARNING: Brake Wear Critical + Low Oil — Schedule Service Now")
        if state.get("battery_voltage", 12.5) < 11.0:
            compound_alerts.append("WARNING: Battery voltage critically low — Risk of stall")

        # Classify health tier
        if overall >= 85:
            tier = "Excellent"
            tier_color = "green"
        elif overall >= 70:
            tier = "Good"
            tier_color = "blue"
        elif overall >= 50:
            tier = "Fair"
            tier_color = "orange"
        elif overall >= 30:
            tier = "Poor"
            tier_color = "red"
        else:
            tier = "Critical"
            tier_color = "darkred"

        return {
            "overall_health": overall,
            "tier": tier,
            "tier_color": tier_color,
            "param_scores": param_scores,
            "anomalies": anomalies,
            "rul": rul,
            "compound_alerts": compound_alerts,
        }

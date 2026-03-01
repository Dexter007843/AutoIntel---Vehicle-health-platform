import random
import time
import math
from typing import Dict, Any, List

# ─────────────────────────────────────────────────────────────
# Complete Vehicle Catalog with Subsystems & Threshold Configs
# ─────────────────────────────────────────────────────────────

def _p(init, mn, mx, optMin, optMax, critBelow, critAbove, unit, label):
    """Helper to build a parameter definition."""
    return {
        "init": init, "min": mn, "max": mx,
        "optMin": optMin, "optMax": optMax,
        "critBelow": critBelow, "critAbove": critAbove,
        "unit": unit, "label": label,
    }

# --- Parameter templates per subsystem ---
ENGINE_PARAMS = {
    "rpm":           _p(850,  0, 8000, 700, 3500, 200, 6500, "RPM", "Engine RPM"),
    "coolant_temp":  _p(35,  -10, 150, 80, 100, 40, 115, "°C", "Coolant Temperature"),
    "oil_pressure":  _p(40,   0, 80, 25, 65, 15, 75, "PSI", "Oil Pressure"),
    "oil_life":      _p(75,   0, 100, 20, 100, 10, 100, "%", "Oil Life"),
}

BRAKE_PARAMS = {
    "brake_pad_wear":    _p(82, 0, 100, 25, 100, 15, 100, "%", "Brake Pad Life"),
    "brake_fluid":       _p(95, 0, 100, 50, 100, 30, 100, "%", "Brake Fluid Level"),
    "brake_disc_temp":   _p(30, 0, 500, 20, 200, 10, 350, "°C", "Brake Disc Temperature"),
}

TRANSMISSION_PARAMS = {
    "trans_temp":     _p(40, 0, 180, 60, 100, 30, 130, "°C", "Transmission Temperature"),
    "trans_slip":     _p(0.5, 0, 15, 0, 3, 0, 8, "%", "Transmission Slip"),
}

ELECTRICAL_PARAMS = {
    "battery_voltage":   _p(12.6, 8, 16, 12.2, 13.2, 10.5, 14.8, "V", "Battery Voltage"),
    "alternator_output": _p(13.8, 0, 16, 13.0, 14.5, 11.0, 15.5, "V", "Alternator Output"),
}

TYRE_PARAMS = {
    "tyre_pressure_fl":  _p(32, 10, 50, 30, 35, 22, 42, "PSI", "Front Left Tyre"),
    "tyre_pressure_fr":  _p(32, 10, 50, 30, 35, 22, 42, "PSI", "Front Right Tyre"),
    "tyre_pressure_rl":  _p(32, 10, 50, 30, 35, 22, 42, "PSI", "Rear Left Tyre"),
    "tyre_pressure_rr":  _p(32, 10, 50, 30, 35, 22, 42, "PSI", "Rear Right Tyre"),
}

EV_BATTERY_PARAMS = {
    "battery_soc":       _p(92, 0, 100, 20, 100, 10, 100, "%", "Battery State of Charge"),
    "cell_voltage_delta": _p(0.02, 0, 1.0, 0, 0.05, 0, 0.3, "V", "Cell Voltage Imbalance"),
    "inverter_temp":     _p(32, 0, 120, 20, 70, 10, 90, "°C", "Inverter Temperature"),
    "motor_temp":        _p(35, 0, 150, 20, 80, 10, 110, "°C", "Motor Temperature"),
}

EMISSIONS_PARAMS = {
    "co2_level":     _p(120, 0, 400, 80, 180, 50, 250, "g/km", "CO₂ Emissions"),
    "exhaust_temp":  _p(300, 0, 900, 200, 500, 100, 700, "°C", "Exhaust Temperature"),
}

# --- Vehicle catalog ---
VEHICLE_CATALOG = {
    "swift-dzire": {
        "name": "Swift Dzire",
        "manufacturer": "Maruti Suzuki",
        "model": "Dzire VXi",
        "year": 2022,
        "fuel_type": "Petrol",
        "plate": "KA01AB1234",
        "type": "car",
        "odometer": 45200,
        "subsystems": {
            "engine":       {"params": ENGINE_PARAMS,       "weight": 1.5},
            "brakes":       {"params": BRAKE_PARAMS,        "weight": 2.0},
            "transmission": {"params": TRANSMISSION_PARAMS, "weight": 1.0},
            "electrical":   {"params": ELECTRICAL_PARAMS,   "weight": 1.0},
            "tyres":        {"params": TYRE_PARAMS,         "weight": 1.2},
            "emissions":    {"params": EMISSIONS_PARAMS,    "weight": 0.8},
        },
    },
    "royal-enfield": {
        "name": "Royal Enfield Classic",
        "manufacturer": "Royal Enfield",
        "model": "Classic 350",
        "year": 2023,
        "fuel_type": "Petrol",
        "plate": "KA05CD5678",
        "type": "car",
        "odometer": 18200,
        "subsystems": {
            "engine":       {"params": ENGINE_PARAMS,       "weight": 1.5},
            "brakes":       {"params": BRAKE_PARAMS,        "weight": 2.0},
            "transmission": {"params": TRANSMISSION_PARAMS, "weight": 1.0},
            "electrical":   {"params": ELECTRICAL_PARAMS,   "weight": 1.0},
            "tyres":        {"params": TYRE_PARAMS,         "weight": 1.2},
        },
    },
    "nexon-ev": {
        "name": "Tata Nexon EV",
        "manufacturer": "Tata Motors",
        "model": "Nexon EV Max",
        "year": 2024,
        "fuel_type": "Electric",
        "plate": "MH02EV9999",
        "type": "ev",
        "odometer": 12600,
        "subsystems": {
            "ev_battery":   {"params": EV_BATTERY_PARAMS,   "weight": 2.0},
            "brakes":       {"params": BRAKE_PARAMS,        "weight": 1.8},
            "electrical":   {"params": ELECTRICAL_PARAMS,   "weight": 1.0},
            "tyres":        {"params": TYRE_PARAMS,         "weight": 1.2},
        },
    },
    "fortuner": {
        "name": "Toyota Fortuner",
        "manufacturer": "Toyota",
        "model": "Fortuner 4x4 AT",
        "year": 2023,
        "fuel_type": "Diesel",
        "plate": "TN10GH4567",
        "type": "suv",
        "odometer": 35800,
        "subsystems": {
            "engine":       {"params": ENGINE_PARAMS,       "weight": 1.5},
            "brakes":       {"params": BRAKE_PARAMS,        "weight": 2.0},
            "transmission": {"params": TRANSMISSION_PARAMS, "weight": 1.2},
            "electrical":   {"params": ELECTRICAL_PARAMS,   "weight": 1.0},
            "tyres":        {"params": TYRE_PARAMS,         "weight": 1.3},
            "emissions":    {"params": EMISSIONS_PARAMS,    "weight": 0.8},
        },
    },
    "tata-ace": {
        "name": "Tata Ace",
        "manufacturer": "Tata Motors",
        "model": "Ace Gold Plus",
        "year": 2021,
        "fuel_type": "Diesel",
        "plate": "AP09JK3456",
        "type": "truck",
        "odometer": 92400,
        "subsystems": {
            "engine":       {"params": ENGINE_PARAMS,       "weight": 1.5},
            "brakes":       {"params": BRAKE_PARAMS,        "weight": 2.5},
            "transmission": {"params": TRANSMISSION_PARAMS, "weight": 1.4},
            "electrical":   {"params": ELECTRICAL_PARAMS,   "weight": 0.8},
            "tyres":        {"params": TYRE_PARAMS,         "weight": 1.5},
            "emissions":    {"params": EMISSIONS_PARAMS,    "weight": 1.0},
        },
    },
}

# --- Fault signatures ---
FAULT_SIGNATURES = {
    "brake_failure":   {"subsystem": "brakes",   "param": "brake_pad_wear",    "rate": -2.5,  "noise": 0.5,  "ticks": 20},
    "brake_fluid_leak":{"subsystem": "brakes",   "param": "brake_fluid",       "rate": -1.5,  "noise": 0.3,  "ticks": 30},
    "overheating":     {"subsystem": "engine",    "param": "coolant_temp",      "rate":  2.0,  "noise": 0.5,  "ticks": 25},
    "oil_leak":        {"subsystem": "engine",    "param": "oil_pressure",      "rate": -1.2,  "noise": 0.4,  "ticks": 30},
    "tyre_slow_leak":  {"subsystem": "tyres",     "param": "tyre_pressure_fl",  "rate": -0.2,  "noise": 0.05, "ticks": 60},
    "tyre_blowout":    {"subsystem": "tyres",     "param": "tyre_pressure_fr",  "rate": -5.0,  "noise": 1.0,  "ticks": 4},
    "battery_drain":   {"subsystem": "electrical","param": "battery_voltage",   "rate": -0.06, "noise": 0.02, "ticks": 50},
    "trans_overheat":  {"subsystem": "transmission","param": "trans_temp",      "rate":  1.8,  "noise": 0.4,  "ticks": 25},
    "ev_cell_imbalance":{"subsystem":"ev_battery","param": "cell_voltage_delta","rate":  0.015,"noise": 0.005,"ticks": 40},
    "ev_battery_drain":{"subsystem": "ev_battery","param": "battery_soc",       "rate": -0.8,  "noise": 0.1,  "ticks": 40},
}

ANOMALY_CHANCE = 0.12  # 12% per tick


class VehicleProfile:
    def __init__(self, vehicle_id: str, catalog: dict):
        self.vehicle_id = vehicle_id
        self.info = {
            "name": catalog["name"],
            "manufacturer": catalog["manufacturer"],
            "model": catalog["model"],
            "year": catalog["year"],
            "fuel_type": catalog["fuel_type"],
            "plate": catalog["plate"],
            "type": catalog["type"],
        }
        self.odometer = catalog["odometer"]
        self.subsystem_defs = catalog["subsystems"]  # reference to definitions
        self.state: Dict[str, Dict[str, float]] = {}  # subsystem -> param -> value
        self.param_configs: Dict[str, Dict[str, dict]] = {}  # subsystem -> param -> config
        self.active_faults: Dict[str, dict] = {}
        self.tick_count = 0
        self.rpm = 850.0
        self.speed = 0.0
        self._init_state()

    def _init_state(self):
        for sys_name, sys_def in self.subsystem_defs.items():
            self.state[sys_name] = {}
            self.param_configs[sys_name] = {}
            for p_name, p_cfg in sys_def["params"].items():
                self.state[sys_name][p_name] = p_cfg["init"]
                self.param_configs[sys_name][p_name] = p_cfg

    def trigger_fault(self, fault_type: str):
        if fault_type in FAULT_SIGNATURES:
            sig = FAULT_SIGNATURES[fault_type]
            # Only inject if this vehicle has the subsystem
            if sig["subsystem"] in self.state:
                self.active_faults[fault_type] = {
                    "subsystem": sig["subsystem"],
                    "param": sig["param"],
                    "rate": sig["rate"],
                    "noise": sig["noise"],
                    "start_tick": self.tick_count,
                    "duration_ticks": sig["ticks"],
                }

    def _clamp(self, sys_name: str, param: str, value: float) -> float:
        cfg = self.param_configs.get(sys_name, {}).get(param, {})
        return max(cfg.get("min", 0), min(cfg.get("max", 999), value))

    def simulate_tick(self) -> Dict[str, Any]:
        random.seed(time.time() + self.tick_count * 13.7)
        self.tick_count += 1

        # --- Driving pattern ---
        if self.tick_count > 3:
            self.rpm = max(600, min(6000, self.rpm + random.gauss(0, 180)))
        else:
            self.rpm = 850 + random.gauss(0, 30)
        self.speed = max(0, self.rpm * 0.018 + random.gauss(0, 2))
        delta_rpm = self.rpm - 850

        # --- Physics-correlated drift per subsystem ---
        for sys_name, params in self.state.items():
            for p_name in list(params.keys()):
                cfg = self.param_configs[sys_name][p_name]
                val = params[p_name]

                # Temperature parameters: correlate with RPM
                if "temp" in p_name and sys_name in ("engine", "transmission"):
                    target = (cfg["optMin"] + cfg["optMax"]) / 2
                    rpm_heat = math.log1p(max(0, delta_rpm)) * 0.04
                    val += (target - val) * 0.025 + rpm_heat + random.gauss(0, 0.3)

                elif p_name == "rpm":
                    val = self.rpm

                elif "pressure" in p_name and sys_name == "tyres":
                    # Tyre pressure affected by temperature
                    engine_temp = self.state.get("engine", {}).get("coolant_temp", 90)
                    temp_effect = (engine_temp - 90) * 0.004
                    val += temp_effect + random.gauss(0, 0.06)

                elif "oil_pressure" in p_name:
                    val = max(15, 40 + (self.rpm - 1000) * 0.004 + random.gauss(0, 0.8))

                elif p_name == "oil_life" or p_name == "brake_pad_wear":
                    # Slow degradation
                    rate = 0.003 + (self.rpm / 6000) * 0.005
                    val -= rate + abs(random.gauss(0, 0.002))

                elif p_name == "brake_fluid":
                    val += random.gauss(0, 0.02)

                elif p_name == "brake_disc_temp":
                    # Correlates with speed
                    target = 30 + self.speed * 1.5
                    val += (target - val) * 0.05 + random.gauss(0, 1.0)

                elif p_name == "trans_slip":
                    val = max(0, 0.5 + (self.rpm / 6000) * 2.0 + random.gauss(0, 0.2))

                elif "battery_voltage" in p_name or "alternator" in p_name:
                    target = cfg["init"]
                    val += (target - val) * 0.02 + random.gauss(0, 0.01)

                elif p_name == "battery_soc":
                    discharge = 0.03 + self.speed * 0.001
                    val = max(0, val - discharge + random.gauss(0, 0.01))

                elif p_name == "cell_voltage_delta":
                    val += random.gauss(0.0005, 0.003)
                    val = max(0.01, val)

                elif p_name == "inverter_temp" or p_name == "motor_temp":
                    soc = self.state.get("ev_battery", {}).get("battery_soc", 80)
                    target = cfg["init"] + (100 - soc) * 0.1
                    val += (target - val) * 0.03 + random.gauss(0, 0.3)

                elif "co2" in p_name or "exhaust" in p_name:
                    target = cfg["init"] + (self.rpm - 850) * 0.02
                    val += (target - val) * 0.04 + random.gauss(0, 1.0)

                else:
                    val += random.gauss(0, 0.1)

                params[p_name] = self._clamp(sys_name, p_name, val)

        # --- Random anomaly injection (12% chance) ---
        if random.random() < ANOMALY_CHANCE:
            # Pick a random subsystem and parameter to spike
            sys_names = list(self.state.keys())
            sys_pick = random.choice(sys_names)
            param_pick = random.choice(list(self.state[sys_pick].keys()))
            cfg = self.param_configs[sys_pick][param_pick]
            # Push towards critical
            if random.random() < 0.5:
                spike = cfg["critAbove"] + random.gauss(0, 3)
            else:
                spike = cfg["critBelow"] - abs(random.gauss(0, 3))
            self.state[sys_pick][param_pick] = self._clamp(sys_pick, param_pick, spike)

        # --- Apply active faults ---
        expired = []
        for fname, finfo in self.active_faults.items():
            elapsed = self.tick_count - finfo["start_tick"]
            if elapsed <= finfo["duration_ticks"]:
                sys_n = finfo["subsystem"]
                p_n = finfo["param"]
                if sys_n in self.state and p_n in self.state[sys_n]:
                    self.state[sys_n][p_n] += finfo["rate"] + random.gauss(0, finfo["noise"])
                    self.state[sys_n][p_n] = self._clamp(sys_n, p_n, self.state[sys_n][p_n])
            else:
                expired.append(fname)
        for f in expired:
            del self.active_faults[f]

        # Odometer
        self.odometer += self.speed * (2.0 / 3600.0)

        # Build flat state + subsystem-grouped state
        flat_state = {}
        subsystem_state = {}
        for sys_name, params in self.state.items():
            subsystem_state[sys_name] = {}
            for p_name, val in params.items():
                rounded = round(val, 2)
                flat_state[p_name] = rounded
                subsystem_state[sys_name][p_name] = rounded

        # Build param configs for frontend
        all_configs = {}
        subsystem_weights = {}
        for sys_name, sys_def in self.subsystem_defs.items():
            subsystem_weights[sys_name] = sys_def["weight"]
            for p_name, cfg in self.param_configs[sys_name].items():
                all_configs[p_name] = {
                    "subsystem": sys_name,
                    "unit": cfg["unit"],
                    "label": cfg["label"],
                    "min": cfg["min"],
                    "max": cfg["max"],
                    "optMin": cfg["optMin"],
                    "optMax": cfg["optMax"],
                    "critBelow": cfg["critBelow"],
                    "critAbove": cfg["critAbove"],
                }

        return {
            "id": self.vehicle_id,
            "timestamp": time.time(),
            "info": self.info.copy(),
            "state": flat_state,
            "subsystems": subsystem_state,
            "paramConfigs": all_configs,
            "subsystemWeights": subsystem_weights,
            "odometer": round(self.odometer, 1),
            "rpm": round(self.rpm, 0),
            "speed": round(self.speed, 1),
            "active_faults": list(self.active_faults.keys()),
        }


class VehicleFactory:
    @staticmethod
    def create_fleet() -> Dict[str, VehicleProfile]:
        return {vid: VehicleProfile(vid, cat) for vid, cat in VEHICLE_CATALOG.items()}

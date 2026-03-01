import asyncio
import json
import time
import re
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from simulator.engine import VehicleFactory, FAULT_SIGNATURES

app = FastAPI(title="Vehicle Health Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory state ---
fleet = VehicleFactory.create_fleet()
snapshots = []
is_simulating = False


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for conn in list(self.active_connections):
            try:
                await conn.send_text(message)
            except Exception:
                self.active_connections.remove(conn)


manager = ConnectionManager()


# --- OTP Mock Auth ---
@app.post("/api/auth/send-otp")
async def send_otp(body: dict):
    phone = body.get("phone", "")
    email = body.get("email", "")
    if phone and re.match(r"^\d{10}$", phone):
        return {"success": True, "message": f"OTP sent to {phone}"}
    if email and re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return {"success": True, "message": f"OTP sent to {email}"}
    return {"success": False, "message": "Invalid phone or email"}


@app.post("/api/auth/verify-otp")
async def verify_otp(body: dict):
    otp = str(body.get("otp", ""))
    if len(otp) == 4 and otp.isdigit():
        return {"success": True, "token": "mock-jwt-token-12345", "user": {"name": "Vignesh"}}
    return {"success": False, "message": "Invalid OTP. Must be 4 digits."}


# --- Fleet REST ---
@app.get("/api/fleet")
async def get_fleet():
    return {"fleet": [v.simulate_tick() for v in fleet.values()]}


@app.get("/api/fleet/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    if vehicle_id not in fleet:
        return {"error": "Vehicle not found"}
    return fleet[vehicle_id].simulate_tick()


@app.get("/api/faults")
async def get_fault_types():
    return {"faults": list(FAULT_SIGNATURES.keys())}


@app.post("/api/fleet/{vehicle_id}/fault")
async def inject_fault(vehicle_id: str, body: dict):
    if vehicle_id not in fleet:
        return {"error": "Vehicle not found"}
    fault_type = body.get("fault_type", "")
    fleet[vehicle_id].trigger_fault(fault_type)
    return {"success": True, "message": f"Fault '{fault_type}' injected into {vehicle_id}"}


# --- WebSocket ---
async def simulation_loop():
    global is_simulating
    if is_simulating:
        return
    is_simulating = True

    while True:
        if len(manager.active_connections) > 0:
            fleet_data = []
            for vid, vehicle in fleet.items():
                telemetry = vehicle.simulate_tick()
                fleet_data.append(telemetry)

            await manager.broadcast(json.dumps({"type": "fleet_update", "data": fleet_data}))

        await asyncio.sleep(2.0)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            command = json.loads(data)

            if command.get("action") == "injectFault":
                vid = command.get("vehicle_id")
                fault_type = command.get("fault_type", "")
                if vid in fleet:
                    fleet[vid].trigger_fault(fault_type)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/health")
def read_health():
    return {"status": "ok"}

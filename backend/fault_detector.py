"""
RAILBLOCK AI - Live Train Tracking & AI Fault Detection Module
Provides:
1. Live Train Location Calculation (Interpolation & GPS snapping along track corridors)
2. AI Anomaly & Defect Detection Engine (Vibration analysis, Geometry deviation, Equipment condition scoring)
"""

import math
import json
from datetime import datetime

# Reference Track Corridor coordinates for Chennai - Vijayawada section (KM 100 to KM 200)
START_LAT = 13.0827  # Chennai Central area approx
START_LNG = 80.2707
END_LAT = 16.5062    # Vijayawada area approx
END_LNG = 80.6480
CORRIDOR_START_KM = 100.0
CORRIDOR_END_KM = 200.0

def km_to_lat_lng(km: float):
    """
    Interpolates approximate Latitude & Longitude based on KM position along the corridor.
    """
    clamped_km = max(CORRIDOR_START_KM, min(CORRIDOR_END_KM, km))
    fraction = (clamped_km - CORRIDOR_START_KM) / (CORRIDOR_END_KM - CORRIDOR_START_KM)
    
    lat = START_LAT + fraction * (END_LAT - START_LAT)
    lng = START_LNG + fraction * (END_LNG - START_LNG)
    return round(lat, 5), round(lng, 5)

def lat_lng_to_km(lat: float, lng: float) -> float:
    """
    Snaps raw GPS (Latitude/Longitude) to the nearest track KM marker.
    """
    d_lat = END_LAT - START_LAT
    d_lng = END_LNG - START_LNG
    if d_lat == 0 and d_lng == 0:
        return CORRIDOR_START_KM
    
    # Projection vector calculation
    u = ((lat - START_LAT) * d_lat + (lng - START_LNG) * d_lng) / (d_lat**2 + d_lng**2)
    fraction = max(0.0, min(1.0, u))
    
    km = CORRIDOR_START_KM + fraction * (CORRIDOR_END_KM - CORRIDOR_START_KM)
    return round(km, 2)

def calculate_live_train_positions(trains: list, telemetry_records: dict, active_plans: list):
    """
    Calculates live real-time position for all trains using time-elapsed interpolation
    or latest ingested GPS telemetry fix.
    Also evaluates proximity warning to active maintenance possession windows.
    """
    now = datetime.now()
    # Use current time of day in minutes
    current_minutes = now.hour * 60 + now.minute + now.second / 60.0

    live_trains = []

    for t in trains:
        t_num = str(t.get("train_number"))
        
        # Check if train has a pushed live GPS fix from smartphone/hardware
        telemetry = telemetry_records.get(t_num)
        
        if telemetry:
            current_km = telemetry["current_km"]
            lat = telemetry["latitude"]
            lng = telemetry["longitude"]
            speed = telemetry["speed_kmh"]
            delay = telemetry["delay_minutes"]
            source = telemetry["source"]
        else:
            # Interpolate location based on current time & schedule
            base_speed = t.get("speed_kmh", 110)
            delay = t.get("delay_minutes", 0)
            direction = t.get("direction", "DOWN")
            
            # Simulated position progression across time (repeats smoothly over hours)
            # Cycle through KM 105 to KM 185
            minute_offset = (current_minutes * 1.2 + hash(t_num) % 50) % 70
            if direction == "DOWN":
                current_km = round(105.0 + minute_offset, 2)
            else:
                current_km = round(185.0 - minute_offset, 2)
            
            lat, lng = km_to_lat_lng(current_km)
            speed = base_speed
            source = "SIMULATED_INTERPOLATION"

        # Check proximity to active maintenance blocks
        status = "EN_ROUTE"
        proximity_warning = None
        closest_block_dist = 999.0

        for plan in active_plans:
            block_start = plan.get("start_km", 142.0)
            block_end = plan.get("end_km", 144.0)
            mid_block = (block_start + block_end) / 2.0
            
            dist = abs(current_km - mid_block)
            if dist < closest_block_dist:
                closest_block_dist = dist

            # Check if train is approaching or inside maintenance block
            if block_start <= current_km <= block_end:
                status = "INSIDE_MAINTENANCE_BLOCK"
                proximity_warning = f"⚠️ Train inside active maintenance zone KM {block_start}-{block_end}!"
            elif dist <= 5.0:
                status = "APPROACHING_MAINTENANCE_ZONE"
                proximity_warning = f"🔔 Warning: Train {closest_block_dist:.1f} KM from active maintenance block."

        live_trains.append({
            "id": t.get("id"),
            "train_number": t_num,
            "train_name": t.get("train_name"),
            "train_type": t.get("train_type"),
            "direction": t.get("direction"),
            "speed_kmh": speed,
            "delay_minutes": delay,
            "current_km": current_km,
            "latitude": lat,
            "longitude": lng,
            "status": status,
            "source": source,
            "proximity_distance_km": round(closest_block_dist, 2),
            "proximity_warning": proximity_warning,
            "last_updated": now.strftime("%H:%M:%S")
        })

    return live_trains


def analyze_telemetry_anomaly(data: dict) -> dict:
    """
    AI Anomaly Detection Engine for Railway Inspection & Telemetry.
    Evaluates:
    - Track Vibration (Normal, Moderate, High, Severe)
    - Geometry Deviation Score
    - Rail Surface Crack / Weld Integrity
    - Signaling / Power Supply Voltage Drop
    Returns AI Diagnostics, Risk Level, Failure Probability, and Required Action.
    """
    vibration = data.get("track_vibration", "Normal")
    geometry = data.get("track_geometry_score", "Good")
    rail_cond = data.get("rail_condition", "Good")
    signal_cond = data.get("signal_condition", "Normal")
    electrical_cond = data.get("electrical_condition", "Normal")

    # Base anomaly weights
    vibe_score = {"Normal": 1.0, "Moderate": 4.0, "High": 8.0, "Severe": 9.5}.get(vibration, 2.0)
    geo_score = {"Good": 1.0, "Fair": 3.5, "Poor": 7.0, "Severe": 9.5}.get(geometry, 2.0)
    rail_score = {"Good": 1.0, "Surface Wear": 4.5, "Rail Crack": 9.0, "Broken Rail": 10.0}.get(rail_cond, 2.0)
    sig_score = {"Normal": 1.0, "Degraded": 5.0, "Fault": 8.5}.get(signal_cond, 1.0)
    elec_score = {"Normal": 1.0, "Tension Drop": 5.5, "Power Supply Issue": 8.5}.get(electrical_cond, 1.0)

    # Combined AI Risk Assessment
    overall_anomaly_score = max(vibe_score, geo_score, rail_score, sig_score, elec_score) * 0.6 + \
                            (vibe_score + geo_score + rail_score + sig_score + elec_score) / 5.0 * 0.4

    overall_anomaly_score = round(min(10.0, max(1.0, overall_anomaly_score)), 1)
    
    # Calculate Failure Probability (Predictive ML simulation)
    failure_prob = round(min(99.0, overall_anomaly_score * 9.8 + (1.5 if vibration == "Severe" else 0.0)), 1)

    # Classification
    if overall_anomaly_score >= 8.0:
        risk_level = "CRITICAL_DEFECT"
        recommendation = "IMMEDIATE EMERGENCY MAINTENANCE possession required. Speed restriction 30 km/h recommended."
        dept = "Track Maintenance & Safety"
    elif overall_anomaly_score >= 6.0:
        risk_level = "HIGH_PRIORITY_MAINTENANCE"
        recommendation = "Schedule bundled maintenance block within 24 hours."
        dept = "Track & Signalling Team"
    elif overall_anomaly_score >= 4.0:
        risk_level = "ATTENTION_REQUIRED"
        recommendation = "Monitor asset closely on next inspection car pass."
        dept = "Routine Inspection"
    else:
        risk_level = "HEALTHY"
        recommendation = "Asset within normal operational safety parameters."
        dept = "Routine Inspection"

    return {
        "anomaly_detected": overall_anomaly_score >= 5.0,
        "ai_risk_score": overall_anomaly_score,
        "risk_level": risk_level,
        "failure_probability_pct": failure_prob,
        "recommendation": recommendation,
        "recommended_department": dept,
        "ai_diagnostics": {
            "vibration_risk": vibe_score,
            "geometry_deviation_risk": geo_score,
            "rail_integrity_risk": rail_score,
            "signal_status_risk": sig_score,
            "electrical_status_risk": elec_score
        }
    }

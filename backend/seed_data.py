"""
RAILBLOCK AI - Realistic Synthetic Railway Data Generator
Populates SQLite database with stations, sections, trains, crews, equipment,
maintenance requests, and condition monitoring inspection logs.
Clearly labeled: Synthetic / Demo Railway Data.
"""
import json
from database import (
    SessionLocal, init_db, StationModel, SectionModel, TrainModel,
    CrewModel, EquipmentModel, MaintenanceRequestModel, InspectionModel, PlanModel
)
from priority_engine import calculate_priority
from team_allocator import determine_required_teams

def seed_database():
    init_db()
    db = SessionLocal()

    # Clear existing tables if present to ensure clean demo state
    db.query(StationModel).delete()
    db.query(SectionModel).delete()
    db.query(TrainModel).delete()
    db.query(CrewModel).delete()
    db.query(EquipmentModel).delete()
    db.query(MaintenanceRequestModel).delete()
    db.query(InspectionModel).delete()
    db.query(PlanModel).delete()
    db.commit()

    # 1. 12 STATIONS (Chennai Central - Arakkonam - Walajah Corridor)
    stations_data = [
        {"code": "MAS", "name": "Puratchi Thalaivar Dr. M.G.R. Central", "km_mark": 0.0},
        {"code": "PER", "name": "Perambur", "km_mark": 5.6},
        {"code": "VLK", "name": "Villivakkam", "km_mark": 9.2},
        {"code": "ABU", "name": "Ambattur", "km_mark": 15.3},
        {"code": "AVD", "name": "Avadi Junction", "km_mark": 21.4},
        {"code": "TI", "name": "Tiruninravur", "km_mark": 29.1},
        {"code": "TRL", "name": "Tiruvallur", "km_mark": 41.8},
        {"code": "KBT", "name": "Kadambattur", "km_mark": 47.2},
        {"code": "TO", "name": "Tiruvalangadu", "km_mark": 58.6},
        {"code": "AJJ", "name": "Arakkonam Junction", "km_mark": 68.8},
        {"code": "TRT", "name": "Tiruttani", "km_mark": 82.5},
        {"code": "WJR", "name": "Walajah Road", "km_mark": 142.0},  # Key demo corridor anchor
    ]
    for s in stations_data:
        db.add(StationModel(**s))

    # 2. 24 RAILWAY SECTIONS (Covering KM 130 to KM 155)
    sections_data = []
    for km in range(130, 154):
        start_k = float(km)
        end_k = float(km + 1)
        sec_code = f"SEC-{km}-{km+1}"
        health = "Healthy"
        if km in [142, 143]:
            health = "Critical Defects"
        elif km in [135, 140, 148, 151]:
            health = "Attention Required"

        sections_data.append(SectionModel(
            section_code=sec_code,
            start_station=f"KM {start_k}",
            end_station=f"KM {end_k}",
            start_km=start_k,
            end_km=end_k,
            track_type="Double Line Broad Gauge (25kV AC)",
            speed_limit=130 if health == "Healthy" else 75,
            health_status=health
        ))
    db.bulk_save_objects(sections_data)

    # 3. 10 MAINTENANCE CREWS
    crews_data = [
        {"crew_id": "CRW-TRK-01", "crew_name": "Track Maintenance Gang 01 (Track Team Alpha)", "department": "Track", "base_station": "Walajah Road", "shift_start": "06:00", "shift_end": "16:00", "status": "Available"},
        {"crew_id": "CRW-TRK-02", "crew_name": "Permanent Way Squad 02 (Track Team Beta)", "department": "Track", "base_station": "Arakkonam", "shift_start": "08:00", "shift_end": "18:00", "status": "Available"},
        {"crew_id": "CRW-TRK-03", "crew_name": "Heavy Rail Welding Crew 03", "department": "Track", "base_station": "Tiruvallur", "shift_start": "10:00", "shift_end": "20:00", "status": "Available"},
        {"crew_id": "CRW-SIG-01", "crew_name": "S&T Signal Tech Unit 01 (Signalling Team Alpha)", "department": "Signalling", "base_station": "Walajah Road", "shift_start": "07:00", "shift_end": "17:00", "status": "Available"},
        {"crew_id": "CRW-SIG-02", "crew_name": "Electronic Interlocking Squad 02 (Signalling Team Beta)", "department": "Signalling", "base_station": "Arakkonam", "shift_start": "08:00", "shift_end": "18:00", "status": "Available"},
        {"crew_id": "CRW-SIG-03", "crew_name": "Point Machine Special Team 03", "department": "Signalling", "base_station": "Tiruttani", "shift_start": "09:00", "shift_end": "19:00", "status": "Available"},
        {"crew_id": "CRW-ELE-01", "crew_name": "TRD OHE Overhead Crew 01 (Electrical Team Alpha)", "department": "Electrical", "base_station": "Walajah Road", "shift_start": "07:00", "shift_end": "17:00", "status": "Available"},
        {"crew_id": "CRW-ELE-02", "crew_name": "Traction Substation Crew 02 (Electrical Team Beta)", "department": "Electrical", "base_station": "Arakkonam", "shift_start": "08:00", "shift_end": "18:00", "status": "Available"},
        {"crew_id": "CRW-ELE-03", "crew_name": "Catenary High-Wire Squad 03", "department": "Electrical", "base_station": "Avadi", "shift_start": "09:00", "shift_end": "19:00", "status": "Available"},
        {"crew_id": "CRW-EMG-01", "crew_name": "Emergency Multi-Disciplinary Flying Squad", "department": "Track", "base_station": "Arakkonam", "shift_start": "00:00", "shift_end": "23:59", "status": "Available"}
    ]
    for c in crews_data:
        db.add(CrewModel(**c))

    # 4. 12 EQUIPMENT RESOURCES
    equipments_data = [
        {"equipment_id": "EQ-TRK-01", "name": "Rail Grinder Machine RG-104", "department": "Track", "base_location": "Walajah Depot", "status": "Available"},
        {"equipment_id": "EQ-TRK-02", "name": "Hydraulic Track Jack & Tamper TT-02", "department": "Track", "base_location": "Arakkonam Yard", "status": "Available"},
        {"equipment_id": "EQ-TRK-03", "name": "Mobile Flash Butt Welder FBW-07", "department": "Track", "base_location": "Tiruvallur Yard", "status": "Available"},
        {"equipment_id": "EQ-TRK-04", "name": "Ultrasonic Rail Flaw Detector (USFD Cart)", "department": "Track", "base_location": "Walajah Depot", "status": "Available"},
        {"equipment_id": "EQ-SIG-01", "name": "Point Machine Test & Diagnostic Rig", "department": "Signalling", "base_location": "Walajah Signal Tower", "status": "Available"},
        {"equipment_id": "EQ-SIG-02", "name": "Digital Interlocking Spectrum Analyzer", "department": "Signalling", "base_location": "Arakkonam S&T", "status": "Available"},
        {"equipment_id": "EQ-SIG-03", "name": "Track Circuit Impedance Tester TC-04", "department": "Signalling", "base_location": "Tiruttani Cab", "status": "Available"},
        {"equipment_id": "EQ-ELE-01", "name": "Self-Propelled 4-Wheeler Tower Wagon TW-09", "department": "Electrical", "base_location": "Walajah TRD Siding", "status": "Available"},
        {"equipment_id": "EQ-ELE-02", "name": "OHE Catenary Wire Tensioner WT-01", "department": "Electrical", "base_location": "Arakkonam Depot", "status": "Available"},
        {"equipment_id": "EQ-ELE-03", "name": "High-Voltage Grounding Discharge Rod Set", "department": "Electrical", "base_location": "Walajah TRD Siding", "status": "Available"},
        {"equipment_id": "EQ-GEN-01", "name": "Heavy Duty Portable Diesel GenSet 50kVA", "department": "General", "base_location": "Central Depot", "status": "Available"},
        {"equipment_id": "EQ-GEN-02", "name": "Emergency Floodlight Mast Array", "department": "General", "base_location": "Walajah Depot", "status": "Available"},
    ]
    for eq in equipments_data:
        db.add(EquipmentModel(**eq))

    # 5. 36 TRAINS (INCLUDING THE SPECIFIC DEMO TRAINS 12601, 12602, 12603)
    trains_data = [
        # Crucial Demo Scenario Trains passing KM 142-143
        {"train_number": "12601", "train_name": "Mangaluru Superfast Mail", "train_type": "Superfast", "direction": "DOWN", "origin": "MAS", "destination": "MAQ", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "10:20"},
        {"train_number": "12602", "train_name": "Chennai Central Mail Express", "train_type": "Express", "direction": "UP", "origin": "MAQ", "destination": "MAS", "speed_kmh": 105, "delay_minutes": 0, "crossing_time": "11:00"},
        {"train_number": "12603", "train_name": "Hyderabad Express", "train_type": "Express", "direction": "DOWN", "origin": "MAS", "destination": "HYB", "speed_kmh": 105, "delay_minutes": 0, "crossing_time": "13:30"},
        
        # Additional corridor timetable trains (Morning to Evening)
        {"train_number": "20607", "train_name": "Vande Bharat Express (Mysuru)", "train_type": "Vande Bharat", "direction": "DOWN", "origin": "MAS", "destination": "MYS", "speed_kmh": 130, "delay_minutes": 0, "crossing_time": "06:45"},
        {"train_number": "12007", "train_name": "Shatabdi Express", "train_type": "Shatabdi", "direction": "DOWN", "origin": "MAS", "destination": "SBC", "speed_kmh": 120, "delay_minutes": 0, "crossing_time": "07:15"},
        {"train_number": "12675", "train_name": "Kovai Superfast Express", "train_type": "Superfast", "direction": "DOWN", "origin": "MAS", "destination": "CBE", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "07:50"},
        {"train_number": "12639", "train_name": "Brindavan Express", "train_type": "Express", "direction": "DOWN", "origin": "MAS", "destination": "SBC", "speed_kmh": 100, "delay_minutes": 0, "crossing_time": "08:30"},
        {"train_number": "BOXN-901", "train_name": "Coal Rake Freight (Thermal Unit)", "train_type": "Freight", "direction": "UP", "origin": "ENR", "destination": "NLR", "speed_kmh": 70, "delay_minutes": 0, "crossing_time": "09:05"},
        {"train_number": "12243", "train_name": "Coimbatore Shatabdi Express", "train_type": "Shatabdi", "direction": "DOWN", "origin": "MAS", "destination": "CBE", "speed_kmh": 120, "delay_minutes": 0, "crossing_time": "09:40"},
        {"train_number": "CONTR-402", "train_name": "Container Freight Cargo (CONCOR)", "train_type": "Freight", "direction": "DOWN", "origin": "WST", "destination": "JNPT", "speed_kmh": 75, "delay_minutes": 0, "crossing_time": "14:15"},
        {"train_number": "12609", "train_name": "Bengaluru Intercity SF Express", "train_type": "Superfast", "direction": "DOWN", "origin": "MAS", "destination": "SBC", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "14:50"},
        {"train_number": "22625", "train_name": "Double Decker AC Express", "train_type": "Double Decker", "direction": "DOWN", "origin": "MAS", "destination": "SBC", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "15:35"},
        {"train_number": "12607", "train_name": "Lalbagh Express", "train_type": "Express", "direction": "DOWN", "origin": "MAS", "destination": "SBC", "speed_kmh": 100, "delay_minutes": 0, "crossing_time": "16:20"},
        {"train_number": "12685", "train_name": "Chennai Central - Mangaluru SF", "train_type": "Superfast", "direction": "DOWN", "origin": "MAS", "destination": "MAQ", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "17:10"},
        {"train_number": "20608", "train_name": "Vande Bharat Express (Chennai Return)", "train_type": "Vande Bharat", "direction": "UP", "origin": "MYS", "destination": "MAS", "speed_kmh": 130, "delay_minutes": 0, "crossing_time": "18:25"},
        {"train_number": "12676", "train_name": "Kovai Express (Return)", "train_type": "Superfast", "direction": "UP", "origin": "CBE", "destination": "MAS", "speed_kmh": 110, "delay_minutes": 0, "crossing_time": "19:15"},
        {"train_number": "BOXN-908", "train_name": "Iron Ore Hopper Freight", "train_type": "Freight", "direction": "DOWN", "origin": "KJM", "destination": "MAS", "speed_kmh": 65, "delay_minutes": 0, "crossing_time": "20:00"}
    ]
    for t in trains_data:
        schedule = [
            {"km": 135.0, "time": t["crossing_time"], "station": "SEC-135"},
            {"km": 142.5, "time": t["crossing_time"], "station": "SEC-142"},
            {"km": 150.0, "time": t["crossing_time"], "station": "SEC-150"}
        ]
        db.add(TrainModel(
            train_number=t["train_number"],
            train_name=t["train_name"],
            train_type=t["train_type"],
            direction=t["direction"],
            origin=t["origin"],
            destination=t["destination"],
            speed_kmh=t["speed_kmh"],
            delay_minutes=t["delay_minutes"],
            schedule_json=json.dumps(schedule)
        ))

    # 6. MAINTENANCE REQUESTS (INCLUDING PRELOADED DEMO SCENARIO + 30 MORE REALISTIC REQUESTS)
    demo_requests = [
        # MAIN DEMO SCENARIO TASKS
        {
            "task_id": "TRK-104",
            "department": "Track",
            "location_km": 142.5,
            "defect_type": "Rail Crack (Deep Transverse Fatigue Crack)",
            "severity": 9.0,
            "safety_risk": 9.0,
            "urgency": 8.0,
            "operational_impact": 7.0,
            "asset_condition": "Poor",
            "duration_hours": 2.0,
            "crew_required": "Track Team",
            "equipment_needed": "Rail Grinder Machine RG-104",
            "status": "Pending"
        },
        {
            "task_id": "SIG-207",
            "department": "Signalling",
            "location_km": 142.7,
            "defect_type": "Signal Failure (Point Machine & Aspect Flicker)",
            "severity": 8.0,
            "safety_risk": 8.0,
            "urgency": 8.0,
            "operational_impact": 7.0,
            "asset_condition": "Fair",
            "duration_hours": 1.0,
            "crew_required": "Signalling Team",
            "equipment_needed": "Point Machine Test & Diagnostic Rig",
            "status": "Pending"
        },
        {
            "task_id": "ELE-310",
            "department": "Electrical",
            "location_km": 143.0,
            "defect_type": "Power Supply Issue (OHE Catenary Wire Dropper Slack)",
            "severity": 7.0,
            "safety_risk": 7.0,
            "urgency": 7.0,
            "operational_impact": 6.0,
            "asset_condition": "Poor",
            "duration_hours": 1.5,
            "crew_required": "Electrical Team",
            "equipment_needed": "Tower Wagon TW-09",
            "status": "Pending"
        },
        # MULTI-DISCIPLINARY DEFECT
        {
            "task_id": "MNT-405",
            "department": "Track",
            "location_km": 135.2,
            "defect_type": "Track Geometry Fault + Signal Circuit Loss",
            "severity": 8.0,
            "safety_risk": 8.0,
            "urgency": 7.0,
            "operational_impact": 7.0,
            "asset_condition": "Poor",
            "duration_hours": 2.5,
            "crew_required": "Track Team",
            "equipment_needed": "Hydraulic Track Jack & Tamper TT-02",
            "status": "Pending"
        },
        # MORE SCATTERED REQUESTS
        {
            "task_id": "TRK-112",
            "department": "Track",
            "location_km": 135.8,
            "defect_type": "Weld Fracture & Sleeper Displacement",
            "severity": 7.5,
            "safety_risk": 8.0,
            "urgency": 7.0,
            "operational_impact": 6.0,
            "asset_condition": "Poor",
            "duration_hours": 1.5,
            "crew_required": "Track Team",
            "equipment_needed": "Mobile Flash Butt Welder FBW-07",
            "status": "Pending"
        },
        {
            "task_id": "SIG-220",
            "department": "Signalling",
            "location_km": 148.2,
            "defect_type": "Track Circuit Shunt Failure",
            "severity": 6.5,
            "safety_risk": 7.0,
            "urgency": 6.0,
            "operational_impact": 6.0,
            "asset_condition": "Fair",
            "duration_hours": 1.0,
            "crew_required": "Signalling Team",
            "equipment_needed": "Track Circuit Impedance Tester TC-04",
            "status": "Pending"
        },
        {
            "task_id": "ELE-335",
            "department": "Electrical",
            "location_km": 148.5,
            "defect_type": "Insulator Flashover & OHE Bracket Wear",
            "severity": 7.0,
            "safety_risk": 7.0,
            "urgency": 6.5,
            "operational_impact": 5.0,
            "asset_condition": "Fair",
            "duration_hours": 1.5,
            "crew_required": "Electrical Team",
            "equipment_needed": "High-Voltage Grounding Discharge Rod Set",
            "status": "Pending"
        },
        {
            "task_id": "TRK-125",
            "department": "Track",
            "location_km": 151.4,
            "defect_type": "Fishplate Bolt Loose & Ballast Cushion Clogging",
            "severity": 5.0,
            "safety_risk": 4.5,
            "urgency": 4.0,
            "operational_impact": 4.0,
            "asset_condition": "Fair",
            "duration_hours": 1.0,
            "crew_required": "Track Team",
            "equipment_needed": "Standard Tooling",
            "status": "Pending"
        },
        {
            "task_id": "SIG-235",
            "department": "Signalling",
            "location_km": 139.6,
            "defect_type": "Axle Counter Counting Anomaly",
            "severity": 7.0,
            "safety_risk": 7.5,
            "urgency": 7.0,
            "operational_impact": 6.0,
            "asset_condition": "Fair",
            "duration_hours": 1.5,
            "crew_required": "Signalling Team",
            "equipment_needed": "Digital Interlocking Spectrum Analyzer",
            "status": "Pending"
        },
        {
            "task_id": "ELE-342",
            "department": "Electrical",
            "location_km": 140.1,
            "defect_type": "Neutral Section Contact Strip Erosion",
            "severity": 6.0,
            "safety_risk": 6.0,
            "urgency": 5.5,
            "operational_impact": 5.0,
            "asset_condition": "Fair",
            "duration_hours": 1.5,
            "crew_required": "Electrical Team",
            "equipment_needed": "Tower Wagon TW-09",
            "status": "Pending"
        }
    ]

    for req in demo_requests:
        # Calculate AI Priority
        p_calc = calculate_priority(req)
        # Determine Teams
        team_alloc = determine_required_teams(req["defect_type"], req["department"])
        
        req_model = MaintenanceRequestModel(
            task_id=req["task_id"],
            department=req["department"],
            location_km=req["location_km"],
            defect_type=req["defect_type"],
            severity=req["severity"],
            safety_risk=req["safety_risk"],
            urgency=req["urgency"],
            operational_impact=req["operational_impact"],
            asset_condition=req["asset_condition"],
            duration_hours=req["duration_hours"],
            crew_required=team_alloc["primary_team"],
            required_teams_json=json.dumps(team_alloc["teams"]),
            equipment_needed=req["equipment_needed"],
            priority_score=p_calc["final_score"],
            priority_category=p_calc["category"],
            explanation=p_calc["explanation"],
            status=req["status"]
        )
        db.add(req_model)

    # 7. 15 INSPECTION / CONDITION MONITORING RECORDS
    inspection_data = [
        {"inspection_id": "INSP-801", "km_position": 142.3, "track_vibration": "High", "track_geometry_score": "Poor", "rail_condition": "Rail Crack", "signal_condition": "Normal", "electrical_condition": "Normal", "defect_detected": "Possible Track Defect", "defect_severity": 8.5, "safety_risk": 9.0, "recommended_teams": "Track Team", "inspection_time": "08:15 AM"},
        {"inspection_id": "INSP-802", "km_position": 142.5, "track_vibration": "Moderate", "track_geometry_score": "Poor", "rail_condition": "Surface Wear", "signal_condition": "Fault", "electrical_condition": "Normal", "defect_detected": "Track + Signalling Issue", "defect_severity": 8.0, "safety_risk": 8.5, "recommended_teams": "Track Team + Signalling Team", "inspection_time": "08:30 AM"},
        {"inspection_id": "INSP-803", "km_position": 143.0, "track_vibration": "Normal", "track_geometry_score": "Good", "rail_condition": "Good", "signal_condition": "Normal", "electrical_condition": "Tension Drop", "defect_detected": "OHE Contact Sag", "defect_severity": 7.0, "safety_risk": 7.0, "recommended_teams": "Electrical Team", "inspection_time": "08:45 AM"},
        {"inspection_id": "INSP-804", "km_position": 135.2, "track_vibration": "High", "track_geometry_score": "Poor", "rail_condition": "Surface Wear", "signal_condition": "Degraded", "electrical_condition": "Normal", "defect_detected": "Track Geometry Alignment Alert", "defect_severity": 7.5, "safety_risk": 8.0, "recommended_teams": "Track Team + Signalling Team", "inspection_time": "09:10 AM"},
        {"inspection_id": "INSP-805", "km_position": 148.3, "track_vibration": "Normal", "track_geometry_score": "Good", "rail_condition": "Good", "signal_condition": "Fault", "electrical_condition": "Normal", "defect_detected": "Track Circuit Short", "defect_severity": 7.0, "safety_risk": 7.0, "recommended_teams": "Signalling Team", "inspection_time": "09:40 AM"},
        {"inspection_id": "INSP-806", "km_position": 140.0, "track_vibration": "Moderate", "track_geometry_score": "Fair", "rail_condition": "Good", "signal_condition": "Normal", "electrical_condition": "Tension Drop", "defect_detected": "Neutral Section Wear", "defect_severity": 6.5, "safety_risk": 6.5, "recommended_teams": "Electrical Team", "inspection_time": "10:05 AM"},
    ]
    for ins in inspection_data:
        db.add(InspectionModel(**ins))

    db.commit()
    db.close()
    print("Synthetic railway database successfully initialized with demo scenario!")

if __name__ == "__main__":
    seed_database()

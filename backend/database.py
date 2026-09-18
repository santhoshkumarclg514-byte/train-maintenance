import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables manually if python-dotenv is absent
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ.setdefault(key.strip(), val.strip())

load_env_file()

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
_pg_server = None

# If not explicitly pointing to another DB, start/connect to local PostgreSQL instance
if not DATABASE_URL or DATABASE_URL.lower() in ("local", "postgres", "postgresql", "true"):
    try:
        import pgserver
        pg_data_dir = os.path.join(os.path.dirname(__file__), "pgdata")
        _pg_server = pgserver.get_server(pg_data_dir, cleanup_mode=None)
        DATABASE_URL = _pg_server.get_uri()
        print(f"[Database Engine] Started & Connected to Native PostgreSQL: {DATABASE_URL}")
    except Exception as e:
        print(f"[Database Engine] Local PostgreSQL init notice ({e}), falling back to SQLite.")
        DATABASE_URL = "sqlite:///./railblock.db"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db_info():
    if "postgresql" in DATABASE_URL:
        return "PostgreSQL 16 (Active)"
    return "SQLite 3 (Active)"



class StationModel(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True)
    name = Column(String(100))
    km_mark = Column(Float)
    division = Column(String(50), default="Southern Railway - MAS")

class SectionModel(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    section_code = Column(String(50), unique=True, index=True)
    start_station = Column(String(50))
    end_station = Column(String(50))
    start_km = Column(Float)
    end_km = Column(Float)
    track_type = Column(String(50), default="Double Electrified")
    speed_limit = Column(Integer, default=130)
    health_status = Column(String(30), default="Healthy")  # Healthy, Attention Required, Critical Defects

class TrainModel(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), unique=True, index=True)
    train_name = Column(String(100))
    train_type = Column(String(50))  # Vande Bharat, Superfast, Express, Freight, Suburban
    direction = Column(String(10))   # UP, DOWN
    origin = Column(String(50))
    destination = Column(String(50))
    speed_kmh = Column(Integer, default=110)
    delay_minutes = Column(Integer, default=0)
    # JSON list of dicts: [{"km": 140.0, "time": "10:05", "station": "TRT"}, ...]
    schedule_json = Column(Text, default="[]")

class CrewModel(Base):
    __tablename__ = "crews"
    id = Column(Integer, primary_key=True, index=True)
    crew_id = Column(String(20), unique=True, index=True)
    crew_name = Column(String(100))
    department = Column(String(50))  # Track, Signalling, Electrical
    base_station = Column(String(50))
    shift_start = Column(String(10), default="08:00")
    shift_end = Column(String(10), default="17:00")
    status = Column(String(30), default="Available")  # Available, Assigned, Resting

class EquipmentModel(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String(20), unique=True, index=True)
    name = Column(String(100))
    department = Column(String(50))
    base_location = Column(String(50))
    status = Column(String(30), default="Available")

class MaintenanceRequestModel(Base):
    __tablename__ = "maintenance_requests"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(30), unique=True, index=True)
    department = Column(String(50))  # Track, Signalling, Electrical
    location_km = Column(Float, index=True)
    defect_type = Column(String(100))
    severity = Column(Float, default=7.0)          # 1 to 10
    safety_risk = Column(Float, default=7.0)       # 1 to 10
    urgency = Column(Float, default=7.0)           # 1 to 10
    operational_impact = Column(Float, default=6.0)# 1 to 10
    asset_condition = Column(String(30), default="Poor") # Good, Fair, Poor, Critical
    duration_hours = Column(Float, default=2.0)
    crew_required = Column(String(50), default="Track Team")
    required_teams_json = Column(Text, default="[\"Track Team\"]")
    equipment_needed = Column(String(100), default="Rail Grinder")
    priority_score = Column(Float, default=7.5)
    priority_category = Column(String(20), default="High") # Critical, High, Medium, Low
    explanation = Column(Text, default="")
    status = Column(String(30), default="Pending") # Pending, Bundled, Scheduled, Approved, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

class InspectionModel(Base):
    __tablename__ = "inspection_records"
    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(String(30), unique=True, index=True)
    km_position = Column(Float, index=True)
    track_vibration = Column(String(30))       # Normal, Moderate, High
    track_geometry_score = Column(String(30))  # Good, Fair, Poor, Severe
    rail_condition = Column(String(30))        # Good, Surface Wear, Rail Crack
    signal_condition = Column(String(30))      # Normal, Degraded, Fault
    electrical_condition = Column(String(30))    # Normal, Tension Drop, Power Supply Issue
    defect_detected = Column(String(100))
    defect_severity = Column(Float, default=7.0)
    safety_risk = Column(Float, default=8.0)
    recommended_teams = Column(String(100))
    inspection_time = Column(String(30))
    converted_to_request = Column(Boolean, default=False)

class PlanModel(Base):
    __tablename__ = "maintenance_plans"
    id = Column(Integer, primary_key=True, index=True)
    plan_code = Column(String(30), unique=True, index=True)
    section_code = Column(String(50))
    start_km = Column(Float)
    end_km = Column(Float)
    start_time = Column(String(10))   # "11:30"
    end_time = Column(String(10))     # "13:30"
    duration_hours = Column(Float)
    bundled_tasks_json = Column(Text) # list of task_ids
    allocated_teams_json = Column(Text) # list of team names
    equipment_json = Column(Text)
    train_conflicts_count = Column(Integer, default=0)
    affected_trains_json = Column(Text, default="[]")
    priority_level = Column(String(20), default="Critical")
    solver_status = Column(String(30), default="OPTIMAL")
    recommendation_reason = Column(Text)
    approval_status = Column(String(30), default="AI_RECOMMENDED") # AI_RECOMMENDED, APPROVED, REJECTED
    controller_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainTelemetryModel(Base):
    __tablename__ = "train_telemetry"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    current_km = Column(Float)
    speed_kmh = Column(Float)
    delay_minutes = Column(Integer, default=0)
    source = Column(String(30), default="SIMULATED") # SIMULATED, GPS_HARDWARE, MOBILE_PWA
    status = Column(String(40), default="EN_ROUTE") # EN_ROUTE, HALTED, CLEAR, APPROACHING_MAINTENANCE_ZONE
    last_updated = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

-- ============================================================
-- RAILBLOCK AI - SUPABASE POSTGRESQL INITIALIZATION SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click RUN
-- ============================================================

-- 1. STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE,
    name VARCHAR(100),
    km_mark FLOAT,
    division VARCHAR(50) DEFAULT 'Southern Railway - MAS'
);

-- 2. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    section_code VARCHAR(50) UNIQUE,
    start_station VARCHAR(50),
    end_station VARCHAR(50),
    start_km FLOAT,
    end_km FLOAT,
    track_type VARCHAR(50) DEFAULT 'Double Electrified',
    speed_limit INTEGER DEFAULT 130,
    health_status VARCHAR(30) DEFAULT 'Healthy'
);

-- 3. TRAINS TABLE
CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20) UNIQUE,
    train_name VARCHAR(100),
    train_type VARCHAR(50),
    direction VARCHAR(10),
    origin VARCHAR(50),
    destination VARCHAR(50),
    speed_kmh INTEGER DEFAULT 110,
    delay_minutes INTEGER DEFAULT 0,
    schedule_json TEXT DEFAULT '[]'
);

-- 4. CREWS TABLE
CREATE TABLE IF NOT EXISTS crews (
    id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) UNIQUE,
    crew_name VARCHAR(100),
    department VARCHAR(50),
    base_station VARCHAR(50),
    shift_start VARCHAR(10) DEFAULT '08:00',
    shift_end VARCHAR(10) DEFAULT '17:00',
    status VARCHAR(30) DEFAULT 'Available'
);

-- 5. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    department VARCHAR(50),
    base_location VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Available'
);

-- 6. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(30) UNIQUE,
    department VARCHAR(50),
    location_km FLOAT,
    defect_type VARCHAR(100),
    severity FLOAT DEFAULT 7.0,
    safety_risk FLOAT DEFAULT 7.0,
    urgency FLOAT DEFAULT 7.0,
    operational_impact FLOAT DEFAULT 6.0,
    asset_condition VARCHAR(30) DEFAULT 'Poor',
    duration_hours FLOAT DEFAULT 2.0,
    crew_required VARCHAR(50) DEFAULT 'Track Team',
    required_teams_json TEXT DEFAULT '["Track Team"]',
    equipment_needed VARCHAR(100) DEFAULT 'Rail Grinder',
    priority_score FLOAT DEFAULT 7.5,
    priority_category VARCHAR(20) DEFAULT 'High',
    explanation TEXT DEFAULT '',
    status VARCHAR(30) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INSPECTION RECORDS TABLE
CREATE TABLE IF NOT EXISTS inspection_records (
    id SERIAL PRIMARY KEY,
    inspection_id VARCHAR(30) UNIQUE,
    km_position FLOAT,
    track_vibration VARCHAR(30),
    track_geometry_score VARCHAR(30),
    rail_condition VARCHAR(30),
    signal_condition VARCHAR(30),
    electrical_condition VARCHAR(30),
    defect_detected VARCHAR(100),
    defect_severity FLOAT DEFAULT 7.0,
    safety_risk FLOAT DEFAULT 8.0,
    recommended_teams VARCHAR(100),
    inspection_time VARCHAR(30),
    converted_to_request BOOLEAN DEFAULT FALSE
);

-- 8. MAINTENANCE PLANS TABLE
CREATE TABLE IF NOT EXISTS maintenance_plans (
    id SERIAL PRIMARY KEY,
    plan_code VARCHAR(30) UNIQUE,
    section_code VARCHAR(50),
    start_km FLOAT,
    end_km FLOAT,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    duration_hours FLOAT,
    bundled_tasks_json TEXT,
    allocated_teams_json TEXT,
    equipment_json TEXT,
    train_conflicts_count INTEGER DEFAULT 0,
    affected_trains_json TEXT DEFAULT '[]',
    priority_level VARCHAR(20) DEFAULT 'Critical',
    solver_status VARCHAR(30) DEFAULT 'OPTIMAL',
    recommendation_reason TEXT,
    approval_status VARCHAR(30) DEFAULT 'AI_RECOMMENDED',
    controller_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TRAIN TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS train_telemetry (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    current_km FLOAT,
    speed_kmh FLOAT,
    delay_minutes INTEGER DEFAULT 0,
    source VARCHAR(30) DEFAULT 'SIMULATED',
    status VARCHAR(40) DEFAULT 'EN_ROUTE',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Supabase Realtime
DO $$ 
BEGIN 
    ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;
    ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_plans;
    ALTER PUBLICATION supabase_realtime ADD TABLE train_telemetry;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Seed data for stations
INSERT INTO stations (code, name, km_mark, division) VALUES ('MAS', 'Puratchi Thalaivar Dr. M.G.R. Central', 0.0, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('PER', 'Perambur', 5.6, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('VLK', 'Villivakkam', 9.2, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('ABU', 'Ambattur', 15.3, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('AVD', 'Avadi Junction', 21.4, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('TI', 'Tiruninravur', 29.1, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('TRL', 'Tiruvallur', 41.8, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('KBT', 'Kadambattur', 47.2, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('TO', 'Tiruvalangadu', 58.6, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('AJJ', 'Arakkonam Junction', 68.8, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('TRT', 'Tiruttani', 82.5, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;
INSERT INTO stations (code, name, km_mark, division) VALUES ('WJR', 'Walajah Road', 142.0, 'Southern Railway - MAS') ON CONFLICT DO NOTHING;

-- Seed data for sections
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-130-131', 'KM 130.0', 'KM 131.0', 130.0, 131.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-131-132', 'KM 131.0', 'KM 132.0', 131.0, 132.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-132-133', 'KM 132.0', 'KM 133.0', 132.0, 133.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-133-134', 'KM 133.0', 'KM 134.0', 133.0, 134.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-134-135', 'KM 134.0', 'KM 135.0', 134.0, 135.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-135-136', 'KM 135.0', 'KM 136.0', 135.0, 136.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Attention Required') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-136-137', 'KM 136.0', 'KM 137.0', 136.0, 137.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-137-138', 'KM 137.0', 'KM 138.0', 137.0, 138.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-138-139', 'KM 138.0', 'KM 139.0', 138.0, 139.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-139-140', 'KM 139.0', 'KM 140.0', 139.0, 140.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-140-141', 'KM 140.0', 'KM 141.0', 140.0, 141.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Attention Required') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-141-142', 'KM 141.0', 'KM 142.0', 141.0, 142.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-142-143', 'KM 142.0', 'KM 143.0', 142.0, 143.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Critical Defects') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-143-144', 'KM 143.0', 'KM 144.0', 143.0, 144.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Critical Defects') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-144-145', 'KM 144.0', 'KM 145.0', 144.0, 145.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-145-146', 'KM 145.0', 'KM 146.0', 145.0, 146.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-146-147', 'KM 146.0', 'KM 147.0', 146.0, 147.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-147-148', 'KM 147.0', 'KM 148.0', 147.0, 148.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-148-149', 'KM 148.0', 'KM 149.0', 148.0, 149.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Attention Required') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-149-150', 'KM 149.0', 'KM 150.0', 149.0, 150.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-150-151', 'KM 150.0', 'KM 151.0', 150.0, 151.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-151-152', 'KM 151.0', 'KM 152.0', 151.0, 152.0, 'Double Line Broad Gauge (25kV AC)', 75, 'Attention Required') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-152-153', 'KM 152.0', 'KM 153.0', 152.0, 153.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;
INSERT INTO sections (section_code, start_station, end_station, start_km, end_km, track_type, speed_limit, health_status) VALUES ('SEC-153-154', 'KM 153.0', 'KM 154.0', 153.0, 154.0, 'Double Line Broad Gauge (25kV AC)', 130, 'Healthy') ON CONFLICT DO NOTHING;

-- Seed data for trains
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12601', 'Mangaluru Superfast Mail', 'Superfast', 'DOWN', 'MAS', 'MAQ', 110, 0, '[{"km": 135.0, "time": "10:20", "station": "SEC-135"}, {"km": 142.5, "time": "10:20", "station": "SEC-142"}, {"km": 150.0, "time": "10:20", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12602', 'Chennai Central Mail Express', 'Express', 'UP', 'MAQ', 'MAS', 105, 0, '[{"km": 135.0, "time": "11:00", "station": "SEC-135"}, {"km": 142.5, "time": "11:00", "station": "SEC-142"}, {"km": 150.0, "time": "11:00", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12603', 'Hyderabad Express', 'Express', 'DOWN', 'MAS', 'HYB', 105, 0, '[{"km": 135.0, "time": "13:30", "station": "SEC-135"}, {"km": 142.5, "time": "13:30", "station": "SEC-142"}, {"km": 150.0, "time": "13:30", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('20607', 'Vande Bharat Express (Mysuru)', 'Vande Bharat', 'DOWN', 'MAS', 'MYS', 130, 0, '[{"km": 135.0, "time": "06:45", "station": "SEC-135"}, {"km": 142.5, "time": "06:45", "station": "SEC-142"}, {"km": 150.0, "time": "06:45", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12007', 'Shatabdi Express', 'Shatabdi', 'DOWN', 'MAS', 'SBC', 120, 0, '[{"km": 135.0, "time": "07:15", "station": "SEC-135"}, {"km": 142.5, "time": "07:15", "station": "SEC-142"}, {"km": 150.0, "time": "07:15", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12675', 'Kovai Superfast Express', 'Superfast', 'DOWN', 'MAS', 'CBE', 110, 0, '[{"km": 135.0, "time": "07:50", "station": "SEC-135"}, {"km": 142.5, "time": "07:50", "station": "SEC-142"}, {"km": 150.0, "time": "07:50", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12639', 'Brindavan Express', 'Express', 'DOWN', 'MAS', 'SBC', 100, 0, '[{"km": 135.0, "time": "08:30", "station": "SEC-135"}, {"km": 142.5, "time": "08:30", "station": "SEC-142"}, {"km": 150.0, "time": "08:30", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('BOXN-901', 'Coal Rake Freight (Thermal Unit)', 'Freight', 'UP', 'ENR', 'NLR', 70, 0, '[{"km": 135.0, "time": "09:05", "station": "SEC-135"}, {"km": 142.5, "time": "09:05", "station": "SEC-142"}, {"km": 150.0, "time": "09:05", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12243', 'Coimbatore Shatabdi Express', 'Shatabdi', 'DOWN', 'MAS', 'CBE', 120, 0, '[{"km": 135.0, "time": "09:40", "station": "SEC-135"}, {"km": 142.5, "time": "09:40", "station": "SEC-142"}, {"km": 150.0, "time": "09:40", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('CONTR-402', 'Container Freight Cargo (CONCOR)', 'Freight', 'DOWN', 'WST', 'JNPT', 75, 0, '[{"km": 135.0, "time": "14:15", "station": "SEC-135"}, {"km": 142.5, "time": "14:15", "station": "SEC-142"}, {"km": 150.0, "time": "14:15", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12609', 'Bengaluru Intercity SF Express', 'Superfast', 'DOWN', 'MAS', 'SBC', 110, 0, '[{"km": 135.0, "time": "14:50", "station": "SEC-135"}, {"km": 142.5, "time": "14:50", "station": "SEC-142"}, {"km": 150.0, "time": "14:50", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('22625', 'Double Decker AC Express', 'Double Decker', 'DOWN', 'MAS', 'SBC', 110, 0, '[{"km": 135.0, "time": "15:35", "station": "SEC-135"}, {"km": 142.5, "time": "15:35", "station": "SEC-142"}, {"km": 150.0, "time": "15:35", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12607', 'Lalbagh Express', 'Express', 'DOWN', 'MAS', 'SBC', 100, 0, '[{"km": 135.0, "time": "16:20", "station": "SEC-135"}, {"km": 142.5, "time": "16:20", "station": "SEC-142"}, {"km": 150.0, "time": "16:20", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12685', 'Chennai Central - Mangaluru SF', 'Superfast', 'DOWN', 'MAS', 'MAQ', 110, 0, '[{"km": 135.0, "time": "17:10", "station": "SEC-135"}, {"km": 142.5, "time": "17:10", "station": "SEC-142"}, {"km": 150.0, "time": "17:10", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('20608', 'Vande Bharat Express (Chennai Return)', 'Vande Bharat', 'UP', 'MYS', 'MAS', 130, 0, '[{"km": 135.0, "time": "18:25", "station": "SEC-135"}, {"km": 142.5, "time": "18:25", "station": "SEC-142"}, {"km": 150.0, "time": "18:25", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('12676', 'Kovai Express (Return)', 'Superfast', 'UP', 'CBE', 'MAS', 110, 0, '[{"km": 135.0, "time": "19:15", "station": "SEC-135"}, {"km": 142.5, "time": "19:15", "station": "SEC-142"}, {"km": 150.0, "time": "19:15", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;
INSERT INTO trains (train_number, train_name, train_type, direction, origin, destination, speed_kmh, delay_minutes, schedule_json) VALUES ('BOXN-908', 'Iron Ore Hopper Freight', 'Freight', 'DOWN', 'KJM', 'MAS', 65, 0, '[{"km": 135.0, "time": "20:00", "station": "SEC-135"}, {"km": 142.5, "time": "20:00", "station": "SEC-142"}, {"km": 150.0, "time": "20:00", "station": "SEC-150"}]') ON CONFLICT DO NOTHING;

-- Seed data for crews
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-TRK-01', 'Track Maintenance Gang 01 (Track Team Alpha)', 'Track', 'Walajah Road', '06:00', '16:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-TRK-02', 'Permanent Way Squad 02 (Track Team Beta)', 'Track', 'Arakkonam', '08:00', '18:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-TRK-03', 'Heavy Rail Welding Crew 03', 'Track', 'Tiruvallur', '10:00', '20:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-SIG-01', 'S&T Signal Tech Unit 01 (Signalling Team Alpha)', 'Signalling', 'Walajah Road', '07:00', '17:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-SIG-02', 'Electronic Interlocking Squad 02 (Signalling Team Beta)', 'Signalling', 'Arakkonam', '08:00', '18:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-SIG-03', 'Point Machine Special Team 03', 'Signalling', 'Tiruttani', '09:00', '19:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-ELE-01', 'TRD OHE Overhead Crew 01 (Electrical Team Alpha)', 'Electrical', 'Walajah Road', '07:00', '17:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-ELE-02', 'Traction Substation Crew 02 (Electrical Team Beta)', 'Electrical', 'Arakkonam', '08:00', '18:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-ELE-03', 'Catenary High-Wire Squad 03', 'Electrical', 'Avadi', '09:00', '19:00', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO crews (crew_id, crew_name, department, base_station, shift_start, shift_end, status) VALUES ('CRW-EMG-01', 'Emergency Multi-Disciplinary Flying Squad', 'Track', 'Arakkonam', '00:00', '23:59', 'Available') ON CONFLICT DO NOTHING;

-- Seed data for equipment
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-TRK-01', 'Rail Grinder Machine RG-104', 'Track', 'Walajah Depot', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-TRK-02', 'Hydraulic Track Jack & Tamper TT-02', 'Track', 'Arakkonam Yard', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-TRK-03', 'Mobile Flash Butt Welder FBW-07', 'Track', 'Tiruvallur Yard', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-TRK-04', 'Ultrasonic Rail Flaw Detector (USFD Cart)', 'Track', 'Walajah Depot', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-SIG-01', 'Point Machine Test & Diagnostic Rig', 'Signalling', 'Walajah Signal Tower', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-SIG-02', 'Digital Interlocking Spectrum Analyzer', 'Signalling', 'Arakkonam S&T', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-SIG-03', 'Track Circuit Impedance Tester TC-04', 'Signalling', 'Tiruttani Cab', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-ELE-01', 'Self-Propelled 4-Wheeler Tower Wagon TW-09', 'Electrical', 'Walajah TRD Siding', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-ELE-02', 'OHE Catenary Wire Tensioner WT-01', 'Electrical', 'Arakkonam Depot', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-ELE-03', 'High-Voltage Grounding Discharge Rod Set', 'Electrical', 'Walajah TRD Siding', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-GEN-01', 'Heavy Duty Portable Diesel GenSet 50kVA', 'General', 'Central Depot', 'Available') ON CONFLICT DO NOTHING;
INSERT INTO equipment (equipment_id, name, department, base_location, status) VALUES ('EQ-GEN-02', 'Emergency Floodlight Mast Array', 'General', 'Walajah Depot', 'Available') ON CONFLICT DO NOTHING;

-- Seed data for maintenance_requests
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('TRK-104', 'Track', 142.5, 'Rail Crack (Deep Transverse Fatigue Crack)', 9.0, 9.0, 8.0, 7.0, 'Poor', 2.0, 'Track Team', '["Track Team"]', 'Rail Grinder Machine RG-104', 8.2, 'Critical', 'CRITICAL PRIORITY: Urgent safety hazard. Dominated by Safety Risk (9.0/10) and Severity (9.0/10). Immediate railway block allocation recommended to prevent derailment or signal failure.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('SIG-207', 'Signalling', 142.7, 'Signal Failure (Point Machine & Aspect Flicker)', 8.0, 8.0, 8.0, 7.0, 'Fair', 1.0, 'Signalling Team', '["Signalling Team"]', 'Point Machine Test & Diagnostic Rig', 7.3, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (8.0/10) and Severity (8.0/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('ELE-310', 'Electrical', 143.0, 'Power Supply Issue (OHE Catenary Wire Dropper Slack)', 7.0, 7.0, 7.0, 6.0, 'Poor', 1.5, 'Electrical Team', '["Electrical Team"]', 'Tower Wagon TW-09', 7.1, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (7.0/10) and Severity (7.0/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('MNT-405', 'Track', 135.2, 'Track Geometry Fault + Signal Circuit Loss', 8.0, 8.0, 7.0, 7.0, 'Poor', 2.5, 'Track Team', '["Track Team", "Signalling Team"]', 'Hydraulic Track Jack & Tamper TT-02', 7.7, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (8.0/10) and Severity (8.0/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('TRK-112', 'Track', 135.8, 'Weld Fracture & Sleeper Displacement', 7.5, 8.0, 7.0, 6.0, 'Poor', 1.5, 'Track Team', '["Track Team"]', 'Mobile Flash Butt Welder FBW-07', 7.4, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (8.0/10) and Severity (7.5/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('SIG-220', 'Signalling', 148.2, 'Track Circuit Shunt Failure', 6.5, 7.0, 6.0, 6.0, 'Fair', 1.0, 'Track Team', '["Track Team", "Signalling Team"]', 'Track Circuit Impedance Tester TC-04', 6.4, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (7.0/10) and Severity (6.5/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('ELE-335', 'Electrical', 148.5, 'Insulator Flashover & OHE Bracket Wear', 7.0, 7.0, 6.5, 5.0, 'Fair', 1.5, 'Electrical Team', '["Electrical Team"]', 'High-Voltage Grounding Discharge Rod Set', 6.5, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (7.0/10) and Severity (7.0/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('TRK-125', 'Track', 151.4, 'Fishplate Bolt Loose & Ballast Cushion Clogging', 5.0, 4.5, 4.0, 4.0, 'Fair', 1.0, 'Track Team', '["Track Team"]', 'Standard Tooling', 5.0, 'Medium', 'MEDIUM PRIORITY: Standard wear and tear (Safety Risk (4.5/10)). Can be safely bundled with adjacent higher-priority blocks.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('SIG-235', 'Signalling', 139.6, 'Axle Counter Counting Anomaly', 7.0, 7.5, 7.0, 6.0, 'Fair', 1.5, 'Signalling Team', '["Signalling Team"]', 'Digital Interlocking Spectrum Analyzer', 6.8, 'High', 'HIGH PRIORITY: Moderate to severe degradation led by Safety Risk (7.5/10) and Severity (7.0/10). Work should be coordinated within 24-48 hour window.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('ELE-342', 'Electrical', 140.1, 'Neutral Section Contact Strip Erosion', 6.0, 6.0, 5.5, 5.0, 'Fair', 1.5, 'Electrical Team', '["Electrical Team"]', 'Tower Wagon TW-09', 5.9, 'Medium', 'MEDIUM PRIORITY: Standard wear and tear (Safety Risk (6.0/10)). Can be safely bundled with adjacent higher-priority blocks.', 'Pending', '2026-09-18 05:35:46.005809') ON CONFLICT DO NOTHING;
INSERT INTO maintenance_requests (task_id, department, location_km, defect_type, severity, safety_risk, urgency, operational_impact, asset_condition, duration_hours, crew_required, required_teams_json, equipment_needed, priority_score, priority_category, explanation, status, created_at) VALUES ('TRA-105', 'Track', 142.5, 'Rail Crack (Deep Transverse Fatigue Crack)', 9.0, 9.0, 8.0, 7.0, 'Poor', 2.0, 'Track Team', '["Track Team"]', 'Rail Grinder Machine RG-104', 8.3, 'Critical', 'CRITICAL PRIORITY: Urgent safety hazard. Dominated by Safety Risk (9.0/10) and Severity (9.0/10). Immediate railway block allocation recommended to prevent derailment or signal failure.', 'Pending', '2026-09-18 05:41:43.192572') ON CONFLICT DO NOTHING;

-- Seed data for inspection_records
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-801', 142.3, 'High', 'Poor', 'Rail Crack', 'Normal', 'Normal', 'Possible Track Defect', 8.5, 9.0, 'Track Team', '08:15 AM', False) ON CONFLICT DO NOTHING;
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-802', 142.5, 'Moderate', 'Poor', 'Surface Wear', 'Fault', 'Normal', 'Track + Signalling Issue', 8.0, 8.5, 'Track Team + Signalling Team', '08:30 AM', False) ON CONFLICT DO NOTHING;
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-803', 143.0, 'Normal', 'Good', 'Good', 'Normal', 'Tension Drop', 'OHE Contact Sag', 7.0, 7.0, 'Electrical Team', '08:45 AM', False) ON CONFLICT DO NOTHING;
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-804', 135.2, 'High', 'Poor', 'Surface Wear', 'Degraded', 'Normal', 'Track Geometry Alignment Alert', 7.5, 8.0, 'Track Team + Signalling Team', '09:10 AM', False) ON CONFLICT DO NOTHING;
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-805', 148.3, 'Normal', 'Good', 'Good', 'Fault', 'Normal', 'Track Circuit Short', 7.0, 7.0, 'Signalling Team', '09:40 AM', False) ON CONFLICT DO NOTHING;
INSERT INTO inspection_records (inspection_id, km_position, track_vibration, track_geometry_score, rail_condition, signal_condition, electrical_condition, defect_detected, defect_severity, safety_risk, recommended_teams, inspection_time, converted_to_request) VALUES ('INSP-806', 140.0, 'Moderate', 'Fair', 'Good', 'Normal', 'Tension Drop', 'Neutral Section Wear', 6.5, 6.5, 'Electrical Team', '10:05 AM', False) ON CONFLICT DO NOTHING;
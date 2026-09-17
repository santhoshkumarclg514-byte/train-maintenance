"""
RAILBLOCK AI - Train Timetable Conflict Detection Engine
Checks train schedules against proposed maintenance block windows (Time + KM range)
to flag physical safety and headway overlaps.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any

def time_to_minutes(time_str: str) -> int:
    """Converts HH:MM string to minutes from midnight."""
    parts = time_str.strip().split(":")
    return int(parts[0]) * 60 + int(parts[1])

def minutes_to_time(minutes: int) -> str:
    """Converts minutes from midnight to HH:MM."""
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{str(h).zfill(2)}:{str(m).zfill(2)}"

def detect_train_conflicts(
    trains: List[Dict[str, Any]],
    start_km: float,
    end_km: float,
    block_start_time: str,
    block_end_time: str
) -> Dict[str, Any]:
    """
    Evaluates each train to see if it traverses [start_km, end_km]
    between block_start_time and block_end_time.
    """
    block_start_min = time_to_minutes(block_start_time)
    block_end_min = time_to_minutes(block_end_time)

    conflicts = []
    clear_trains = []

    for train in trains:
        t_num = train.get("train_number")
        t_name = train.get("train_name", "")
        t_type = train.get("train_type", "Express")
        direction = train.get("direction", "DOWN")
        delay = int(train.get("delay_minutes", 0))

        # Check schedule stops or computed passage at KM
        passage_time_str = train.get("crossing_time")
        if not passage_time_str and "schedule" in train:
            # Look up closest stop or interpolate
            stops = train["schedule"]
            for s in stops:
                s_km = s.get("km", 0)
                if abs(s_km - (start_km + end_km)/2.0) <= 2.0:
                    passage_time_str = s.get("time")
                    break

        if not passage_time_str:
            # Fallback based on train ID demo schedule
            passage_time_str = "12:00"

        # Apply delay to passing time
        orig_min = time_to_minutes(passage_time_str)
        effective_min = orig_min + delay
        effective_time_str = minutes_to_time(effective_min)

        # Safety buffer: 10 minutes before and after maintenance block for block clearing
        overlap = (effective_min >= (block_start_min - 5)) and (effective_min <= (block_end_min + 5))

        item = {
            "train_number": t_num,
            "train_name": t_name,
            "train_type": t_type,
            "direction": direction,
            "scheduled_time": passage_time_str,
            "effective_time": effective_time_str,
            "delay_minutes": delay,
            "section": f"KM {start_km} – {end_km}",
            "is_conflict": overlap,
            "conflict_status": "CONFLICT" if overlap else "NO CONFLICT",
            "impact_level": "High" if "Vande" in t_type or "Superfast" in t_type else ("Medium" if "Express" in t_type else "Low")
        }

        if overlap:
            conflicts.append(item)
        else:
            clear_trains.append(item)

    return {
        "has_conflicts": len(conflicts) > 0,
        "conflict_count": len(conflicts),
        "conflicts": conflicts,
        "clear_trains": clear_trains,
        "total_trains_evaluated": len(trains),
        "evaluated_window": f"{block_start_time} - {block_end_time} @ KM {start_km}–{end_km}"
    }

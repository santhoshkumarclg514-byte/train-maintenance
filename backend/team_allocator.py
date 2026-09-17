"""
RAILBLOCK AI - Smart Team Allocation Engine
Determines the minimal necessary maintenance teams based on defect types,
equipment needs, and department responsibilities.
"""
from typing import List, Dict, Any

TRACK_KEYWORDS = [
    "rail crack", "crack", "geometry", "weld", "sleeper", "ballast", "fracture",
    "track", "alignment", "fishplate", "turnout mechanical", "derailment risk", "rail wear"
]

SIGNALLING_KEYWORDS = [
    "signal", "point machine", "interlocking", "track circuit", "axle counter",
    "relay", "aspect", "telecom", "block instrument", "signal lamp", "shunt signal"
]

ELECTRICAL_KEYWORDS = [
    "power", "ohe", "overhead", "catenary", "pantograph", "traction", "substation",
    "insulator", "feeder", "transformer", "neutral section", "contact wire", "dropper"
]

def determine_required_teams(defect_type: str, department: str = "") -> Dict[str, Any]:
    text = (f"{defect_type} {department}").lower()
    
    needed_teams = []
    reasons = []

    is_track = any(kw in text for kw in TRACK_KEYWORDS) or department.lower() == "track"
    is_signal = any(kw in text for kw in SIGNALLING_KEYWORDS) or department.lower() in ["signalling", "signal"]
    is_electrical = any(kw in text for kw in ELECTRICAL_KEYWORDS) or department.lower() in ["electrical", "traction"]

    if is_track:
        needed_teams.append("Track Team")
        reasons.append("Track engineering personnel required for permanent way / rail structural maintenance.")
    if is_signal:
        needed_teams.append("Signalling Team")
        reasons.append("Signal & Telecom technicians required for electronics, points, and interlocking validation.")
    if is_electrical:
        needed_teams.append("Electrical Team")
        reasons.append("TRD (Traction Distribution) crew required for OHE isolation, grounding, and power lines.")

    # Fallback to department if none matched keywords
    if not needed_teams:
        if "elec" in department.lower():
            needed_teams.append("Electrical Team")
            reasons.append("Assigned Electrical Team based on originating department.")
        elif "sig" in department.lower():
            needed_teams.append("Signalling Team")
            reasons.append("Assigned Signalling Team based on originating department.")
        else:
            needed_teams.append("Track Team")
            reasons.append("Assigned Track Team as baseline rail infrastructure unit.")

    return {
        "teams": needed_teams,
        "team_count": len(needed_teams),
        "primary_team": needed_teams[0],
        "is_multi_disciplinary": len(needed_teams) > 1,
        "justification": " | ".join(reasons)
    }

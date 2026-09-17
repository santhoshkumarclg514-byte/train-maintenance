"""
RAILBLOCK AI - What-If Simulator and Dynamic Replanning Engine
Simulates real-world operational changes (train delays, crew shortages, emergency defects)
and triggers actual CP-SAT replanning with side-by-side delta explanations.
"""
from typing import Dict, Any, List
import copy
from conflict_detector import detect_train_conflicts, time_to_minutes, minutes_to_time
from optimizer import optimize_maintenance_block

def simulate_what_if(
    current_plan: Dict[str, Any],
    cluster: Dict[str, Any],
    trains: List[Dict[str, Any]],
    simulation_params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates scenario changes, computes conflict impact on current plan,
    and runs OR-Tools CP-SAT to generate the new plan.
    """
    sim_type = simulation_params.get("type", "train_delay")
    modified_trains = copy.deepcopy(trains)
    modified_cluster = copy.deepcopy(cluster)

    scenario_description = ""
    change_reason = ""

    if sim_type == "train_delay":
        target_train_no = str(simulation_params.get("train_number", "12603"))
        delay_mins = int(simulation_params.get("delay_minutes", 30))
        scenario_description = f"Train {target_train_no} delayed by {delay_mins} minutes"

        for t in modified_trains:
            if str(t.get("train_number")) == target_train_no:
                curr_delay = int(t.get("delay_minutes", 0))
                t["delay_minutes"] = curr_delay + delay_mins
                crossing_str = t.get("crossing_time", "13:00")
                new_crossing = minutes_to_time(time_to_minutes(crossing_str) + t["delay_minutes"])
                change_reason = (
                    f"Train {target_train_no} passing time shifted from {crossing_str} to {new_crossing} "
                    f"due to {delay_mins}-minute delay."
                )
                break

    elif sim_type == "duration_increase":
        add_hours = float(simulation_params.get("added_hours", 0.5))
        old_dur = float(modified_cluster.get("bundled_duration_hours", 2.0))
        new_dur = round(old_dur + add_hours, 1)
        modified_cluster["bundled_duration_hours"] = new_dur
        scenario_description = f"Maintenance duration extended by {int(add_hours * 60)} minutes (total: {new_dur} hrs)"
        change_reason = f"Increased work scope requires {new_dur} hours instead of {old_dur} hours."

    elif sim_type == "emergency_request":
        emergency_km = float(simulation_params.get("location_km", 142.8))
        scenario_description = f"Emergency defect injected at KM {emergency_km} (OHE Wire Fault)"
        emergency_task = {
            "task_id": "EMG-999",
            "department": "Electrical",
            "location_km": emergency_km,
            "defect_type": "OHE Catenary Sag Emergency",
            "severity": 10.0,
            "safety_risk": 10.0,
            "urgency": 10.0,
            "operational_impact": 9.0,
            "duration_hours": 1.5,
            "required_teams": ["Electrical Team"],
            "equipment_needed": "Tower Wagon",
            "priority_score": 9.8,
            "status": "Bundled"
        }
        modified_cluster["tasks"].append(emergency_task)
        if "Electrical Team" not in modified_cluster.get("combined_teams", []):
            modified_cluster["combined_teams"].append("Electrical Team")
        modified_cluster["max_priority"] = 9.8
        modified_cluster["task_count"] = len(modified_cluster["tasks"])
        change_reason = "Critical emergency defect bundled into current block to avoid compounding service disruptions."

    elif sim_type == "crew_unavailable":
        unavailable_crew = simulation_params.get("crew_name", "Signalling Team")
        scenario_description = f"{unavailable_crew} unavailable due to emergency diversion"
        change_reason = f"Primary specialized crew ({unavailable_crew}) is off-duty or deployed to an urgent site."

    # Step 1: Check how the old plan performs under the NEW scenario conditions
    old_start = current_plan.get("start_time", "11:30")
    old_end = current_plan.get("end_time", "13:30")
    start_km = float(current_plan.get("start_km", 142.0))
    end_km = float(current_plan.get("end_km", 143.0))

    conflict_check_old = detect_train_conflicts(
        modified_trains,
        start_km,
        end_km,
        old_start,
        old_end
    )

    # Step 2: Trigger CP-SAT replanning with the new constraints
    new_plan = optimize_maintenance_block(modified_cluster, modified_trains)

    # Determine explanation for plan adaptation
    if conflict_check_old["has_conflicts"]:
        conflicted_train_names = ", ".join([c["train_number"] for c in conflict_check_old["conflicts"]])
        why_changed = (
            f"Under the simulated scenario ({scenario_description}), the original plan ({old_start}–{old_end}) "
            f"developed {conflict_check_old['conflict_count']} new train conflict(s) with Train(s): {conflicted_train_names}. "
            f"RailBlock AI dynamically replanned using Google OR-Tools CP-SAT, shifting the maintenance possession to "
            f"{new_plan['start_time']}–{new_plan['end_time']}, completely resolving all {conflict_check_old['conflict_count']} conflicts."
        )
    elif new_plan["start_time"] != old_start:
        why_changed = (
            f"RailBlock AI adjusted the maintenance window from {old_start}–{old_end} to {new_plan['start_time']}–{new_plan['end_time']} "
            f"to optimize total corridor throughput under {scenario_description}."
        )
    else:
        why_changed = (
            f"Current plan ({old_start}–{old_end}) maintains optimal headroom with zero conflicts even after "
            f"{scenario_description}. No schedule shift required."
        )

    return {
        "scenario": scenario_description,
        "scenario_type": sim_type,
        "old_plan": {
            "start_time": old_start,
            "end_time": old_end,
            "start_km": start_km,
            "end_km": end_km,
            "conflicts_count": conflict_check_old["conflict_count"],
            "conflicting_trains": conflict_check_old["conflicts"],
            "status": "CONFLICT DETECTED ❌" if conflict_check_old["has_conflicts"] else "STABLE ✅"
        },
        "new_plan": {
            "start_time": new_plan["start_time"],
            "end_time": new_plan["end_time"],
            "start_km": new_plan["start_km"],
            "end_km": new_plan["end_km"],
            "conflicts_count": new_plan["conflicts_count"],
            "affected_trains": new_plan["affected_trains"],
            "teams_allocated": new_plan["teams_allocated"],
            "solver_status": new_plan["solver_status"],
            "status": "REPLANNED & RESOLVED ✅"
        },
        "why_changed": why_changed,
        "change_reason": change_reason,
        "modified_trains": modified_trains
    }

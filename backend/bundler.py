"""
RAILBLOCK AI - Smart Task Bundling Engine
Uses DBSCAN geo-spatial clustering to combine nearby compatible maintenance
jobs (e.g. Track + Signalling + Electrical within 1.5-2.0 km) into a single coordinated block.
"""
import numpy as np
from sklearn.cluster import DBSCAN
from typing import List, Dict, Any

def bundle_maintenance_tasks(tasks: List[Dict[str, Any]], eps_km: float = 1.5) -> List[Dict[str, Any]]:
    """
    Groups maintenance tasks within eps_km distance into unified railway block candidates.
    """
    if not tasks:
        return []

    if len(tasks) == 1:
        task = tasks[0]
        return [{
            "cluster_id": f"RB-{str(task.get('id', '001')).zfill(3)}",
            "start_km": round(task["location_km"] - 0.5, 1),
            "end_km": round(task["location_km"] + 0.5, 1),
            "center_km": round(task["location_km"], 1),
            "task_count": 1,
            "tasks": [task],
            "combined_teams": list(set(task.get("required_teams", ["Track Team"]))),
            "combined_equipment": [task.get("equipment_needed", "Standard Tooling")],
            "bundled_duration_hours": float(task.get("duration_hours", 2.0)),
            "max_priority": float(task.get("priority_score", 7.0)),
            "cluster_reason": f"Single high-priority task requiring dedicated block at KM {task['location_km']}."
        }]

    # Extract KM locations for DBSCAN
    kms = np.array([[t["location_km"]] for t in tasks])
    
    # DBSCAN with eps in km (e.g. 1.5 km), min_samples=1 so isolated tasks form singletons
    db = DBSCAN(eps=eps_km, min_samples=1).fit(kms)
    labels = db.labels_

    clusters_dict = {}
    for idx, label in enumerate(labels):
        if label not in clusters_dict:
            clusters_dict[label] = []
        clusters_dict[label].append(tasks[idx])

    bundled_results = []
    cluster_idx = 21 # Start from RB-021 for realistic railway numbering
    for label, group_tasks in clusters_dict.items():
        group_kms = [t["location_km"] for t in group_tasks]
        min_km = min(group_kms)
        max_km = max(group_kms)
        
        # Buffer of 0.2 km on boundaries for safety overlaps
        block_start_km = round(max(0.0, min_km - 0.2), 1)
        block_end_km = round(max_km + 0.2, 1)

        # Aggregate teams
        all_teams = set()
        for t in group_tasks:
            teams = t.get("required_teams", [])
            if isinstance(teams, list):
                all_teams.update(teams)
            elif isinstance(teams, str):
                all_teams.add(teams)
            crew_req = t.get("crew_required")
            if crew_req:
                all_teams.add(crew_req)

        # Aggregate equipment
        all_equipment = list(set([
            t.get("equipment_needed", "Standard Tooling") for t in group_tasks if t.get("equipment_needed")
        ]))

        # Smart duration: concurrent work on separate KM points within the block
        durations = [float(t.get("duration_hours", 1.5)) for t in group_tasks]
        bundled_duration = round(max(durations), 1)

        max_priority = max([float(t.get("priority_score", 5.0)) for t in group_tasks])

        cluster_id = f"RB-{str(cluster_idx).zfill(3)}"
        cluster_idx += 1

        depts = list(set([t.get("department", "Track") for t in group_tasks]))
        dept_str = " + ".join(depts)

        if len(group_tasks) > 1:
            reason = (
                f"{len(group_tasks)} compatible maintenance tasks ({dept_str}) are geographically "
                f"clustered between KM {block_start_km}–{block_end_km}. Bundling into a single coordinated block "
                f"saves {len(group_tasks) - 1} separate track possessions and minimizes train headway disruptions."
            )
        else:
            reason = f"Isolated maintenance task at KM {block_start_km} scheduled as an individual block."

        bundled_results.append({
            "cluster_id": cluster_id,
            "start_km": block_start_km,
            "end_km": block_end_km,
            "center_km": round((block_start_km + block_end_km) / 2.0, 1),
            "task_count": len(group_tasks),
            "tasks": group_tasks,
            "combined_teams": sorted(list(all_teams)),
            "combined_equipment": all_equipment,
            "bundled_duration_hours": bundled_duration,
            "max_priority": max_priority,
            "cluster_reason": reason
        })

    # Sort clusters by highest priority first
    bundled_results.sort(key=lambda c: c["max_priority"], reverse=True)
    return bundled_results

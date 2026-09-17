"""
RAILBLOCK AI - Explainable AI Maintenance Priority Engine
Computes 1-10 priority score based on 8 weighted factors with transparent breakdown.
"""
from typing import Dict, Any, List

WEIGHTS = {
    "safety_risk": 0.25,
    "severity": 0.20,
    "urgency": 0.15,
    "asset_condition": 0.15,
    "operational_impact": 0.10,
    "train_traffic": 0.05,
    "maintenance_overdue": 0.05,
    "location_criticality": 0.05
}

def parse_asset_condition(val: Any) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    str_val = str(val).lower()
    if "crit" in str_val:
        return 9.5
    elif "poor" in str_val:
        return 8.5
    elif "fair" in str_val:
        return 5.5
    elif "good" in str_val:
        return 3.0
    return 6.0

def calculate_priority(data: Dict[str, Any]) -> Dict[str, Any]:
    safety_risk = float(data.get("safety_risk", 7.0))
    severity = float(data.get("severity", 7.0))
    urgency = float(data.get("urgency", 7.0))
    asset_cond_val = parse_asset_condition(data.get("asset_condition", 8.0))
    operational_impact = float(data.get("operational_impact", 6.0))
    train_traffic = float(data.get("train_traffic", 7.5))
    maintenance_overdue = float(data.get("maintenance_overdue", 6.0))
    location_criticality = float(data.get("location_criticality", 7.0))

    raw_factors = {
        "safety_risk": safety_risk,
        "severity": severity,
        "urgency": urgency,
        "asset_condition": asset_cond_val,
        "operational_impact": operational_impact,
        "train_traffic": train_traffic,
        "maintenance_overdue": maintenance_overdue,
        "location_criticality": location_criticality
    }

    weighted_contributions = {}
    total_score = 0.0
    for factor, weight in WEIGHTS.items():
        val = raw_factors[factor]
        contribution = val * weight
        weighted_contributions[factor] = round(contribution, 3)
        total_score += contribution

    final_score = round(min(10.0, max(1.0, total_score)), 1)

    if final_score >= 8.0:
        category = "Critical"
    elif final_score >= 6.0:
        category = "High"
    elif final_score >= 4.0:
        category = "Medium"
    else:
        category = "Low"

    # Generate transparent explanation
    top_factors = sorted(
        [(k, v, raw_factors[k]) for k, v in weighted_contributions.items()],
        key=lambda x: x[1],
        reverse=True
    )
    top_names = [f"{tf[0].replace('_', ' ').title()} ({tf[2]}/10)" for tf in top_factors[:2]]
    
    if final_score >= 8.0:
        explanation = f"CRITICAL PRIORITY: Urgent safety hazard. Dominated by {top_names[0]} and {top_names[1]}. Immediate railway block allocation recommended to prevent derailment or signal failure."
    elif final_score >= 6.0:
        explanation = f"HIGH PRIORITY: Moderate to severe degradation led by {top_names[0]} and {top_names[1]}. Work should be coordinated within 24-48 hour window."
    elif final_score >= 4.0:
        explanation = f"MEDIUM PRIORITY: Standard wear and tear ({top_names[0]}). Can be safely bundled with adjacent higher-priority blocks."
    else:
        explanation = f"LOW PRIORITY: Minor maintenance item ({top_names[0]}). Schedule during scheduled idle maintenance intervals."

    breakdown_list = []
    for factor, weight in WEIGHTS.items():
        breakdown_list.append({
            "factor": factor,
            "label": factor.replace("_", " ").title(),
            "raw_value": round(raw_factors[factor], 1),
            "weight_pct": int(weight * 100),
            "weighted_contribution": weighted_contributions[factor]
        })

    return {
        "final_score": final_score,
        "category": category,
        "explanation": explanation,
        "factor_breakdown": breakdown_list
    }

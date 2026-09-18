"""
RAILBLOCK AI - Google Gemini Integration Service
Connects to Google Gemini 3.6 Flash API to generate live AI incident diagnostics,
safety advisories, and Section Controller executive plan summaries.
"""
import os
import json
import urllib.request
import urllib.error

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

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.6-flash"
API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """
    Sends a prompt to Google Gemini 3.6 Flash API and returns text response.
    Falls back gracefully to structured fallback text if API key is missing or network fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key or api_key == "your_gemini_api_key_here":
        return None

    url = API_URL_TEMPLATE.format(model=GEMINI_MODEL, key=api_key)
    
    contents = []
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"}]
        })
    else:
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 300
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            candidates = res_data.get('candidates', [])
            if candidates and 'content' in candidates[0]:
                parts = candidates[0]['content'].get('parts', [])
                if parts and 'text' in parts[0]:
                    return parts[0]['text'].strip()
    except Exception as e:
        print(f"[Gemini Service Warning] Direct API call error: {e}")

    return None


def generate_ai_defect_analysis(defect_data: dict) -> dict:
    """
    Generates AI safety risk advisory and root-cause analysis for track inspections.
    """
    prompt = (
        f"You are the Chief AI Safety Officer for Indian Railways. Analyze this track telemetry anomaly:\n"
        f"- Location: KM {defect_data.get('km_position', 142.5)}\n"
        f"- Defect Detected: {defect_data.get('defect_detected', 'Track Vibration')}\n"
        f"- Vibration Level: {defect_data.get('track_vibration', 'High')}\n"
        f"- Track Geometry Score: {defect_data.get('track_geometry_score', 'Poor')}\n"
        f"- Rail Condition: {defect_data.get('rail_condition', 'Surface Wear')}\n"
        f"- Signal/Electrical: Signal={defect_data.get('signal_condition')}, OHE={defect_data.get('electrical_condition')}\n\n"
        f"Provide a concise 2-sentence executive assessment including recommended speed restriction (PSR) and required maintenance action."
    )
    
    sys_inst = "Act as an expert Indian Railways civil & signalling track engineer. Be concise, authoritative, and precise."
    ai_text = call_gemini(prompt, system_instruction=sys_inst)
    
    if ai_text:
        return {
            "ai_generated": True,
            "analysis_text": ai_text,
            "model_used": GEMINI_MODEL
        }
    
    # Fallback response
    return {
        "ai_generated": False,
        "analysis_text": f"[AI ADVISORY] High vibration & poor geometry detected at KM {defect_data.get('km_position', 142.5)}. Recommend immediate 30 km/h speed restriction and USFD ultrasonic re-testing.",
        "model_used": "Rule-Based Fallback"
    }


def generate_controller_plan_rationale(plan_data: dict) -> str:
    """
    Generates executive justification note for Section Chief Controller.
    """
    prompt = (
        f"Summarize this railway maintenance block schedule for the Section Chief Controller in 2 concise sentences:\n"
        f"- Plan Code: {plan_data.get('plan_code', 'RB-021')}\n"
        f"- Section: {plan_data.get('start_km', 142.0)} KM to {plan_data.get('end_km', 143.0)} KM\n"
        f"- Time Window: {plan_data.get('start_time', '11:15')} - {plan_data.get('end_time', '13:15')}\n"
        f"- Tasks Bundled: {plan_data.get('task_count', 3)} concurrent departments (Track, Signalling, Electrical)\n"
        f"- Train Headway Conflicts Avoided: {plan_data.get('conflicts_avoided', 2)}"
    )
    
    ai_text = call_gemini(prompt)
    if ai_text:
        return ai_text
    
    return f"Coordinated 3 maintenance tasks into a single zero-conflict window ({plan_data.get('start_time', '11:15')} - {plan_data.get('end_time', '13:15')}), preventing train delays."

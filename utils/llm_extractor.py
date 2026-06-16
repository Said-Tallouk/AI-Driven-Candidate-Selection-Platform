"""
utils/llm_extractor.py — Extraction structurée via Groq (Llama 3.3 70B)
"""

import json
from groq import Groq

_SYSTEM = """You are an expert HR assistant specialized in CV and job offer analysis.
Extract structured information from the provided text and return a JSON object with exactly these fields:
{
  "candidate_name": "full name of the candidate (first and last name) or null if not found",
  "skills": ["list of all technical and soft skills mentioned"],
  "experience": {
    "years": <integer or null>,
    "domains": ["list of professional domains or job areas"]
  },
  "education": [
    {"degree": "degree level (e.g. Master, Licence, Bac+5)", "field": "field of study", "school": "institution name or null"}
  ]
}
Rules:
- Extract only what is explicitly present in the text.
- For candidate_name: look at the top of the CV for the person's full name; return null if unclear.
- For skills: include programming languages, frameworks, tools, methodologies, soft skills.
- For experience years: look for patterns like "3 ans", "2 years", "5+ years", "expérience de X".
- Return empty lists/null if information is absent.
- Do not infer or hallucinate missing information."""

_PLAN_SYSTEM = """You are an expert career coach and technical trainer.
A candidate did not reach the required score for a job offer.
Generate a personalized improvement plan in French to help them succeed in the future.
Return a JSON object with exactly these fields:
{
  "summary": "2-3 sentence analysis of the candidate gap in French",
  "priority_skills": ["top 3-5 missing skills to learn first, ordered by priority"],
  "learning_path": [
    {
      "skill": "skill name",
      "why": "why this skill is important for the role (1 sentence)",
      "resources": [
        {"type": "cours|certification|livre|projet", "name": "resource name", "platform": "YouTube|OpenClassrooms|freeCodeCamp|Coursera|Udemy|other", "duration": "estimated duration", "youtube_search": "exact search query to find this video on YouTube e.g. 'React tutorial francais debutant 2024'"}
      ],
      "project": "1 concrete hands-on project to practice this skill"
    }
  ],
  "certifications": [
    {"name": "certification name", "platform": "Coursera|Udemy|Google|AWS|Microsoft etc.", "relevance": "why it helps for this role"}
  ],
  "soft_skills": ["soft skills to develop if any"],
  "timeline": "realistic timeline e.g. 3-6 mois",
  "encouragement": "short motivating message in French for the candidate"
}
Rules:
- All text fields must be in French.
- Be specific and actionable — no vague advice.
- Prioritize missing skills from the job offer.
- Suggest free or affordable resources when possible (Coursera, YouTube, OpenClassrooms, freeCodeCamp).
- Limit learning_path to top 4 skills maximum."""


def extract_profile(text: str, api_key: str) -> dict:
    """
    Calls Groq Llama-3.3-70b to extract skills, experience, and education from text.
    Returns a dict with keys: skills, experience, education.
    On error, returns a dict with an 'error' key.
    """
    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": f"Extract information from this text:\n\n{text[:4500]}"},
            ],
            temperature=0.0,
            max_tokens=800,
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"skills": [], "experience": {"years": None, "domains": []}, "education": [], "error": str(e)}


def generate_improvement_plan(
    offer_title: str,
    missing_skills: list[str],
    candidate_skills: list[str],
    experience_years: int | None,
    match_rate: float,
    api_key: str,
) -> dict:
    """
    Generates a personalized improvement plan for a rejected candidate.
    Returns a structured plan with learning path, certifications, and timeline.
    On error, returns a dict with an 'error' key.
    """
    try:
        client = Groq(api_key=api_key)
        user_prompt = f"""
Poste visé : {offer_title}
Score de compatibilité obtenu : {match_rate:.1f}%
Compétences manquantes : {', '.join(missing_skills) if missing_skills else 'aucune identifiée'}
Compétences actuelles du candidat : {', '.join(candidate_skills[:15]) if candidate_skills else 'non détectées'}
Expérience : {f"{experience_years} an(s)" if experience_years else "non précisée"}

Génère un plan d'amélioration personnalisé pour aider ce candidat à atteindre ce poste.
"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _PLAN_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=1500,
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}


def compare_skills(offer_skills: list[str], cv_skills: list[str]) -> dict:
    """
    Compares skills between offer and CV (case-insensitive match).
    Returns matched, missing (from offer), bonus (CV only), and match rate %.
    """
    offer_map = {s.lower(): s for s in offer_skills}
    cv_map    = {s.lower(): s for s in cv_skills}

    matched = [offer_map[k] for k in offer_map if k in cv_map]
    missing = [offer_map[k] for k in offer_map if k not in cv_map]
    bonus   = [cv_map[k]   for k in cv_map   if k not in offer_map]

    rate = (len(matched) / len(offer_map) * 100) if offer_map else 0.0
    return {"matched": matched, "missing": missing, "bonus": bonus, "rate": rate}

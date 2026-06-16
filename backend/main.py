"""
backend/main.py — Skills Matcher Pro API (FastAPI)
Lancer : uvicorn backend.main:app --reload --port 8000
"""

import io
import json
import os
import sys
import uuid
import datetime
from typing import List, Optional

import PyPDF2
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

_ROOT = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(_ROOT, ".env"))
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

sys.path.insert(0, _ROOT)

# ── Persistance JSON ───────────────────────────────────────────────────────────
_DB_DIR  = os.path.join(_ROOT, "data", "db")
_CV_DIR  = os.path.join(_DB_DIR, "cvs")
os.makedirs(_DB_DIR, exist_ok=True)
os.makedirs(_CV_DIR, exist_ok=True)

def _load(filename: str, default):
    path = os.path.join(_DB_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _save(filename: str, data):
    path = os.path.join(_DB_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def _persist():
    _save("offers.json",       _OFFERS)
    _save("applications.json", _APPLICATIONS)
    _save("analyses.json",     _ANALYSES)


def _extract_pdf_text(content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF illisible : {e}")


app = FastAPI(title="Skills Matcher Pro API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Stockage (chargé depuis disque au démarrage) ───────────────────────────────
_USERS        = {"admin": "rh2024", "rh": "password123"}
_TOKENS: dict = {}
_OFFERS: dict       = _load("offers.json",       {})
_ANALYSES: dict     = _load("analyses.json",     {})
_APPLICATIONS: dict = _load("applications.json", {})

security = HTTPBearer()


def _require_auth(creds: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = creds.credentials
    if token not in _TOKENS:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return _TOKENS[token]


# ── Auth ───────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/auth/login")
def login(req: LoginRequest):
    if _USERS.get(req.username) != req.password:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    token = str(uuid.uuid4())
    _TOKENS[token] = req.username
    return {"token": token, "username": req.username}


@app.post("/api/auth/logout")
def logout(creds: HTTPAuthorizationCredentials = Depends(security)):
    _TOKENS.pop(creds.credentials, None)
    return {"message": "Déconnecté"}


# ── Offres d'emploi (RH) ───────────────────────────────────────────────────────

class OfferRequest(BaseModel):
    title: str
    skills: List[str] = []
    experience: int = 0
    level: str = "Confirmé"
    description: str = ""


@app.get("/api/offers")
def list_offers(user: str = Depends(_require_auth)):
    return list(_OFFERS.values())


@app.post("/api/offers")
def create_offer(req: OfferRequest, user: str = Depends(_require_auth)):
    offer_id = str(uuid.uuid4())
    offer = {
        "id": offer_id,
        "title": req.title,
        "skills": req.skills,
        "experience": req.experience,
        "level": req.level,
        "description": req.description,
        "text": (
            f"{req.title}\n{req.description}\n"
            f"Compétences: {', '.join(req.skills)}\n"
            f"Expérience: {req.experience} ans"
        ),
        "source": "form",
        "published": False,
        "created_by": user,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    _OFFERS[offer_id] = offer
    _persist()
    return offer


@app.get("/api/offers/{offer_id}")
def get_offer(offer_id: str, user: str = Depends(_require_auth)):
    if offer_id not in _OFFERS:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return _OFFERS[offer_id]


@app.delete("/api/offers/{offer_id}")
def delete_offer(offer_id: str, user: str = Depends(_require_auth)):
    _OFFERS.pop(offer_id, None)
    _ANALYSES.pop(offer_id, None)
    _APPLICATIONS.pop(offer_id, None)
    _persist()
    return {"message": "Supprimé"}


@app.patch("/api/offers/{offer_id}/publish")
def publish_offer(offer_id: str, published: bool, user: str = Depends(_require_auth)):
    if offer_id not in _OFFERS:
        raise HTTPException(404, "Offre non trouvée")
    _OFFERS[offer_id]["published"] = published
    _persist()
    return _OFFERS[offer_id]


# ── Upload offre PDF ───────────────────────────────────────────────────────────

@app.post("/api/offers/upload-pdf")
async def upload_offer_pdf(
    file: UploadFile = File(...),
    user: str = Depends(_require_auth),
):
    content = await file.read()
    text = _extract_pdf_text(content)
    if not text.strip():
        raise HTTPException(400, "PDF illisible ou vide")

    offer_id = str(uuid.uuid4())
    offer = {
        "id": offer_id,
        "title": file.filename.replace(".pdf", ""),
        "skills": [],
        "experience": 0,
        "level": "Non spécifié",
        "description": text[:500],
        "text": text,
        "source": "pdf",
        "published": False,
        "created_by": user,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    _OFFERS[offer_id] = offer
    _persist()
    return offer


# ── Portail public candidats ───────────────────────────────────────────────────

@app.get("/api/public/offers")
def public_list_offers():
    return [
        {k: v for k, v in o.items() if k != "text"}
        for o in _OFFERS.values()
        if o.get("published")
    ]


@app.get("/api/public/offers/{offer_id}")
def public_get_offer(offer_id: str):
    offer = _OFFERS.get(offer_id)
    if not offer or not offer.get("published"):
        raise HTTPException(404, "Offre non trouvée ou non publiée")
    return {k: v for k, v in offer.items() if k != "text"}


@app.post("/api/public/offers/{offer_id}/apply")
async def apply(
    offer_id: str,
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    file: UploadFile = File(...),
):
    if offer_id not in _OFFERS or not _OFFERS[offer_id].get("published"):
        raise HTTPException(404, "Offre non trouvée ou non publiée")

    content = await file.read()
    cv_text = _extract_pdf_text(content)
    if not cv_text.strip():
        raise HTTPException(400, "CV illisible ou vide")

    app_id   = str(uuid.uuid4())
    cv_path  = os.path.join(_CV_DIR, f"{app_id}.pdf")
    with open(cv_path, "wb") as f_out:
        f_out.write(content)

    application = {
        "id": app_id,
        "candidate_name": candidate_name.strip(),
        "candidate_email": candidate_email.strip(),
        "filename": file.filename,
        "cv_path": cv_path,
        "cv_text": cv_text,
        "submitted_at": datetime.datetime.utcnow().isoformat(),
    }
    _APPLICATIONS.setdefault(offer_id, []).append(application)
    _persist()
    return {"message": "Candidature soumise avec succès", "id": app_id}


# ── Candidatures (RH) ──────────────────────────────────────────────────────────

@app.get("/api/offers/{offer_id}/applications/{app_id}/cv")
def download_cv(offer_id: str, app_id: str, user: str = Depends(_require_auth)):
    apps = _APPLICATIONS.get(offer_id, [])
    app  = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(404, "Candidature introuvable")
    cv_path = app.get("cv_path", "")
    if not cv_path or not os.path.exists(cv_path):
        raise HTTPException(404, "Fichier CV introuvable sur le serveur")
    return FileResponse(
        cv_path,
        media_type="application/pdf",
        filename=app.get("filename", f"{app_id}.pdf"),
    )


@app.get("/api/offers/{offer_id}/applications")
def list_applications(offer_id: str, user: str = Depends(_require_auth)):
    apps = _APPLICATIONS.get(offer_id, [])
    return [
        {k: v for k, v in a.items() if k != "cv_text"}
        for a in apps
    ]


@app.post("/api/offers/{offer_id}/applications/{app_id}/analyze")
async def analyze_single_application(offer_id: str, app_id: str, user: str = Depends(_require_auth)):
    """Analyse un seul CV sans toucher aux autres résultats existants."""
    if offer_id not in _OFFERS:
        raise HTTPException(404, "Offre non trouvée")

    apps = _APPLICATIONS.get(offer_id, [])
    app_data = next((a for a in apps if a["id"] == app_id), None)
    if not app_data:
        raise HTTPException(404, "Candidature introuvable")

    try:
        from utils.llm_extractor import compare_skills, extract_profile, generate_improvement_plan
    except ImportError as e:
        raise HTTPException(500, f"Module llm_extractor introuvable : {e}")

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("VOTRE"):
        raise HTTPException(400, "Clé API Groq manquante dans le fichier .env")

    offer = _OFFERS[offer_id]
    offer_skills = offer.get("skills", [])
    if not offer_skills and offer.get("text"):
        offer_data = extract_profile(offer["text"], GROQ_API_KEY)
        if "error" not in offer_data:
            offer_skills = offer_data.get("skills", [])
            _OFFERS[offer_id]["skills"] = offer_skills

    cv_text = app_data.get("cv_text", "")
    fallback_name = app_data["candidate_name"]

    if not cv_text.strip():
        raise HTTPException(400, "CV vide ou sans texte")

    cv_data = extract_profile(cv_text, GROQ_API_KEY)
    if "error" in cv_data:
        raise HTTPException(500, cv_data["error"])

    candidate_name = cv_data.get("candidate_name") or fallback_name
    match      = compare_skills(offer_skills, cv_data.get("skills", []))
    match_rate = round(match["rate"], 1)

    result = {
        "id": app_id,
        "name": candidate_name,
        "email": app_data.get("candidate_email", ""),
        "skills": cv_data.get("skills", []),
        "experience": cv_data.get("experience", {}),
        "education": cv_data.get("education", []),
        "match": match,
        "match_rate": match_rate,
    }

    if match_rate < 60:
        plan = generate_improvement_plan(
            offer_title      = offer.get("title", ""),
            missing_skills   = match.get("missing", []),
            candidate_skills = cv_data.get("skills", []),
            experience_years = cv_data.get("experience", {}).get("years"),
            match_rate       = match_rate,
            api_key          = GROQ_API_KEY,
        )
        result["improvement_plan"] = plan if "error" not in plan else None

    # Ajouter ou remplacer dans la liste des résultats existants
    existing = _ANALYSES.get(offer_id, [])
    existing = [r for r in existing if r.get("id") != app_id and r.get("name") != fallback_name]
    existing.append(result)
    _ANALYSES[offer_id] = existing
    _persist()

    return result


@app.post("/api/offers/{offer_id}/analyze-applications")
async def analyze_applications(offer_id: str, user: str = Depends(_require_auth)):
    if offer_id not in _OFFERS:
        raise HTTPException(404, "Offre non trouvée")

    apps = _APPLICATIONS.get(offer_id, [])
    if not apps:
        raise HTTPException(400, "Aucune candidature reçue pour cette offre")

    try:
        from utils.llm_extractor import compare_skills, extract_profile, generate_improvement_plan
    except ImportError as e:
        raise HTTPException(500, f"Module llm_extractor introuvable : {e}")

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("VOTRE"):
        raise HTTPException(400, "Clé API Groq manquante dans le fichier .env")

    offer = _OFFERS[offer_id]
    offer_skills = offer.get("skills", [])

    if not offer_skills and offer.get("text"):
        offer_data = extract_profile(offer["text"], GROQ_API_KEY)
        if "error" not in offer_data:
            offer_skills = offer_data.get("skills", [])
            _OFFERS[offer_id]["skills"] = offer_skills

    results = []
    for app_data in apps:
        fallback_name = app_data["candidate_name"]
        cv_text = app_data.get("cv_text", "")

        if not cv_text.strip():
            results.append({"name": fallback_name, "error": "CV vide ou sans texte"})
            continue

        cv_data = extract_profile(cv_text, GROQ_API_KEY)
        if "error" in cv_data:
            results.append({"name": fallback_name, "error": cv_data["error"]})
            continue

        candidate_name = cv_data.get("candidate_name") or fallback_name
        match      = compare_skills(offer_skills, cv_data.get("skills", []))
        match_rate = round(match["rate"], 1)

        result = {
            "name": candidate_name,
            "email": app_data.get("candidate_email", ""),
            "skills": cv_data.get("skills", []),
            "experience": cv_data.get("experience", {}),
            "education": cv_data.get("education", []),
            "match": match,
            "match_rate": match_rate,
        }

        # Plan d'amélioration automatique pour les candidats non retenus
        if match_rate < 60:
            plan = generate_improvement_plan(
                offer_title      = offer.get("title", ""),
                missing_skills   = match.get("missing", []),
                candidate_skills = cv_data.get("skills", []),
                experience_years = cv_data.get("experience", {}).get("years"),
                match_rate       = match_rate,
                api_key          = GROQ_API_KEY,
            )
            result["improvement_plan"] = plan if "error" not in plan else None

        results.append(result)

    _ANALYSES[offer_id] = results
    _persist()
    return {"offer_id": offer_id, "results": results, "count": len(results)}


# ── Analyse manuelle (upload direct) ──────────────────────────────────────────

@app.get("/api/config/key-status")
def key_status(user: str = Depends(_require_auth)):
    configured = bool(GROQ_API_KEY and not GROQ_API_KEY.startswith("VOTRE"))
    return {"configured": configured, "source": ".env" if configured else "none"}


@app.post("/api/analysis/{offer_id}")
async def analyze_cvs(
    offer_id: str,
    files: List[UploadFile] = File(...),
    user: str = Depends(_require_auth),
):
    if offer_id not in _OFFERS:
        raise HTTPException(404, "Offre non trouvée")

    try:
        from utils.llm_extractor import compare_skills, extract_profile, generate_improvement_plan
    except ImportError as e:
        raise HTTPException(500, f"Module llm_extractor introuvable : {e}")

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("VOTRE"):
        raise HTTPException(400, "Clé API Groq manquante dans le fichier .env")

    offer = _OFFERS[offer_id]
    offer_skills = offer.get("skills", [])

    if not offer_skills and offer.get("text"):
        offer_data = extract_profile(offer["text"], GROQ_API_KEY)
        if "error" not in offer_data:
            offer_skills = offer_data.get("skills", [])
            _OFFERS[offer_id]["skills"] = offer_skills

    results = []
    for f in files:
        name = f.filename.replace(".pdf", "")
        content = await f.read()

        try:
            cv_text = _extract_pdf_text(content)
        except HTTPException as e:
            results.append({"name": name, "error": e.detail})
            continue

        if not cv_text.strip():
            results.append({"name": name, "error": "PDF vide ou sans texte"})
            continue

        cv_data = extract_profile(cv_text, GROQ_API_KEY)
        if "error" in cv_data:
            results.append({"name": name, "error": cv_data["error"]})
            continue

        candidate_name = cv_data.get("candidate_name") or name
        match      = compare_skills(offer_skills, cv_data.get("skills", []))
        match_rate = round(match["rate"], 1)

        result = {
            "name": candidate_name,
            "skills": cv_data.get("skills", []),
            "experience": cv_data.get("experience", {}),
            "education": cv_data.get("education", []),
            "match": match,
            "match_rate": match_rate,
        }

        if match_rate < 60:
            plan = generate_improvement_plan(
                offer_title      = offer.get("title", ""),
                missing_skills   = match.get("missing", []),
                candidate_skills = cv_data.get("skills", []),
                experience_years = cv_data.get("experience", {}).get("years"),
                match_rate       = match_rate,
                api_key          = GROQ_API_KEY,
            )
            result["improvement_plan"] = plan if "error" not in plan else None

        results.append(result)

    _ANALYSES[offer_id] = results
    _persist()
    return {"offer_id": offer_id, "results": results, "count": len(results)}


@app.get("/api/analysis/{offer_id}")
def get_analysis(offer_id: str, user: str = Depends(_require_auth)):
    return {"offer_id": offer_id, "results": _ANALYSES.get(offer_id, [])}


# ── Plan d'amélioration IA ─────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    candidate_name: str
    offer_id: str


@app.post("/api/recommendation")
def get_recommendation(req: RecommendationRequest, user: str = Depends(_require_auth)):
    if req.offer_id not in _OFFERS:
        raise HTTPException(404, "Offre non trouvée")

    results = _ANALYSES.get(req.offer_id, [])
    candidate = next((r for r in results if r.get("name") == req.candidate_name), None)
    if not candidate:
        raise HTTPException(404, "Candidat non trouvé dans les résultats")

    try:
        from utils.llm_extractor import generate_improvement_plan
    except ImportError as e:
        raise HTTPException(500, f"Module introuvable : {e}")

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("VOTRE"):
        raise HTTPException(400, "Clé API Groq manquante")

    offer  = _OFFERS[req.offer_id]
    plan   = generate_improvement_plan(
        offer_title      = offer.get("title", ""),
        missing_skills   = candidate.get("match", {}).get("missing", []),
        candidate_skills = candidate.get("skills", []),
        experience_years = candidate.get("experience", {}).get("years"),
        match_rate       = candidate.get("match_rate", 0),
        api_key          = GROQ_API_KEY,
    )
    return plan


# ── Communication email ────────────────────────────────────────────────────────

class EmailRequest(BaseModel):
    offer_id:       str
    candidate_name: str
    template:       str   # "interview" | "rejection" | "custom"
    custom_message: str = ""


@app.post("/api/communication/send")
def send_communication(req: EmailRequest, user: str = Depends(_require_auth)):
    if not SMTP_EMAIL or not SMTP_PASSWORD or SMTP_PASSWORD == "VOTRE_APP_PASSWORD_ICI":
        raise HTTPException(400, "Email SMTP non configuré dans le fichier .env")

    # Trouver le candidat dans les résultats
    results  = _ANALYSES.get(req.offer_id, [])
    candidate = next((r for r in results if r.get("name") == req.candidate_name), None)
    offer     = _OFFERS.get(req.offer_id, {})

    if not candidate:
        raise HTTPException(404, "Candidat introuvable dans les résultats d'analyse")

    # Email stocké directement dans les résultats d'analyse
    to_email = candidate.get("email", "")

    # Fallback : chercher dans les candidatures (correspondance souple)
    if not to_email:
        apps = _APPLICATIONS.get(req.offer_id, [])
        app  = next(
            (a for a in apps if a.get("candidate_name", "").lower() == req.candidate_name.lower()),
            None,
        )
        to_email = (app or {}).get("candidate_email", "")

    if not to_email:
        raise HTTPException(400, "Email du candidat introuvable")

    from utils.email_sender import (
        build_interview_email, build_rejection_email,
        build_custom_email, send_email,
    )

    offer_title = offer.get("title", "le poste")
    plan        = candidate.get("improvement_plan") or {}

    if req.template == "interview":
        subject = f"✅ Invitation à un entretien – {offer_title}"
        html    = build_interview_email(req.candidate_name, offer_title, req.custom_message)

    elif req.template == "rejection":
        subject = f"📋 Application Result – {offer_title}"
        html    = build_rejection_email(
            candidate_name = req.candidate_name,
            offer_title    = offer_title,
            plan           = plan,
            custom_message = req.custom_message,
        )

    else:
        if not req.custom_message.strip():
            raise HTTPException(400, "Le message personnalisé est vide")
        subject = f"Message de recrutement – {offer_title}"
        html    = build_custom_email(req.candidate_name, offer_title, req.custom_message)

    result = send_email(SMTP_EMAIL, SMTP_PASSWORD, to_email, subject, html)

    if not result["success"]:
        raise HTTPException(500, result["error"])

    # Sauvegarder l'historique de communication
    if "communications" not in candidate:
        candidate["communications"] = []
    candidate["communications"].append({
        "template": req.template,
        "sent_at":  datetime.datetime.utcnow().isoformat(),
        "to":       to_email,
    })
    _persist()

    return {"message": f"Email envoyé à {to_email}", "to": to_email}


class BulkEmailRequest(BaseModel):
    offer_id:       str
    target:         str   # "rejected" | "accepted" | "all"
    custom_message: str = ""


@app.post("/api/communication/send-bulk")
def send_bulk_communication(req: BulkEmailRequest, user: str = Depends(_require_auth)):
    if not SMTP_EMAIL or not SMTP_PASSWORD or SMTP_PASSWORD == "VOTRE_APP_PASSWORD_ICI":
        raise HTTPException(400, "Email SMTP non configuré dans le fichier .env")

    results  = _ANALYSES.get(req.offer_id, [])
    offer    = _OFFERS.get(req.offer_id, {})

    if req.target == "rejected":
        targets = [c for c in results if not c.get("error") and c.get("match_rate", 0) < 60]
    elif req.target == "accepted":
        targets = [c for c in results if not c.get("error") and c.get("match_rate", 0) >= 60]
    else:
        targets = [c for c in results if not c.get("error")]

    if not targets:
        raise HTTPException(400, "Aucun candidat dans cette catégorie")

    from utils.email_sender import (
        build_interview_email, build_rejection_email, send_email,
    )

    offer_title = offer.get("title", "le poste")
    sent_ok, sent_fail = [], []

    for candidate in targets:
        to_email = candidate.get("email", "")
        if not to_email:
            apps = _APPLICATIONS.get(req.offer_id, [])
            app  = next(
                (a for a in apps if a.get("candidate_name", "").lower() == candidate.get("name", "").lower()),
                None,
            )
            to_email = (app or {}).get("candidate_email", "")

        if not to_email:
            sent_fail.append({"name": candidate.get("name"), "reason": "Email introuvable"})
            continue

        plan = candidate.get("improvement_plan") or {}

        if req.target == "accepted":
            subject = f"✅ Invitation à un entretien – {offer_title}"
            html    = build_interview_email(candidate.get("name", ""), offer_title, req.custom_message)
        else:
            subject = f"📋 Application Result – {offer_title}"
            html    = build_rejection_email(
                candidate_name = candidate.get("name", ""),
                offer_title    = offer_title,
                plan           = plan,
                custom_message = req.custom_message,
            )

        result = send_email(SMTP_EMAIL, SMTP_PASSWORD, to_email, subject, html)

        if result["success"]:
            sent_ok.append(candidate.get("name"))
            if "communications" not in candidate:
                candidate["communications"] = []
            candidate["communications"].append({
                "template": "rejection" if req.target != "accepted" else "interview",
                "sent_at": datetime.datetime.utcnow().isoformat(),
                "to": to_email,
                "bulk": True,
            })
        else:
            sent_fail.append({"name": candidate.get("name"), "reason": result["error"]})

    _persist()
    return {
        "sent": len(sent_ok),
        "failed": len(sent_fail),
        "sent_names": sent_ok,
        "failed_details": sent_fail,
    }


@app.get("/api/communication/{offer_id}/{candidate_name}")
def get_communications(offer_id: str, candidate_name: str, user: str = Depends(_require_auth)):
    results   = _ANALYSES.get(offer_id, [])
    candidate = next((r for r in results if r.get("name") == candidate_name), None)
    if not candidate:
        return {"communications": []}
    return {"communications": candidate.get("communications", [])}


# ── Dashboard ──────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard(user: str = Depends(_require_auth)):
    all_cvs  = [cv for cvs in _ANALYSES.values() for cv in cvs if "error" not in cv]
    accepted = [c for c in all_cvs if c.get("match_rate", 0) >= 60]
    avg      = sum(c["match_rate"] for c in all_cvs) / len(all_cvs) if all_cvs else 0
    top      = sorted(all_cvs, key=lambda x: x["match_rate"], reverse=True)[:5]
    total_apps = sum(len(v) for v in _APPLICATIONS.values())

    return {
        "total_offers": len(_OFFERS),
        "published_offers": sum(1 for o in _OFFERS.values() if o.get("published")),
        "total_applications": total_apps,
        "total_cvs":    len(all_cvs),
        "accepted":     len(accepted),
        "rejected":     len(all_cvs) - len(accepted),
        "avg_rate":     round(avg, 1),
        "top_candidates": top,
        "active_offer": next(iter(_OFFERS.values()), None),
    }

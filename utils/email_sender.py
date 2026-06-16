"""
utils/email_sender.py — Envoi d'emails HTML via Gmail SMTP
"""

import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

_RESOURCE_ICONS = {
    'cours':         '📚',
    'certification': '🏆',
    'livre':         '📖',
    'projet':        '💻',
}


def _html_wrapper(content: str, title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#4c1d95,#4338ca);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🎯</div>
        <h1 style="margin:0;color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
          Skills<span style="color:#c4b5fd;">Matcher</span> Pro
        </h1>
        <p style="margin:4px 0 0;color:#a5b4fc;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
          AI Recruitment System
        </p>
      </td></tr>

      <!-- Content -->
      <tr><td style="background:white;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        {content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:11px;">
          This message was sent automatically by SkillsMatcher Pro · {datetime.now().strftime("%d/%m/%Y")}
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


# ── Interview email ────────────────────────────────────────────────────────────

def build_interview_email(candidate_name: str, offer_title: str, custom_message: str = "") -> str:
    content = f"""
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:800;">
      Congratulations, {candidate_name}! 🎉
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      We have carefully reviewed your application for the position of
      <strong style="color:#4f46e5;">{offer_title}</strong>.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:18px;">✅</p>
      <strong style="color:#166534;font-size:15px;">Your profile has been selected!</strong>
      <p style="margin:8px 0 0;color:#166534;font-size:13px;line-height:1.6;">
        Your background matches our selection criteria. We would love to meet you
        for an interview to learn more about your experience and goals.
      </p>
    </div>

    {f'<div style="background:#f8fafc;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;"><p style="margin:0;color:#334155;font-size:13px;line-height:1.6;">{custom_message}</p></div>' if custom_message else ''}

    <p style="color:#475569;font-size:13px;line-height:1.8;margin:0 0 24px;">
      We will reach out to you shortly to schedule a convenient interview date.
      In the meantime, feel free to prepare a brief overview of your key projects and achievements.
    </p>

    <div style="background:#f5f3ff;border-radius:12px;padding:20px;text-align:center;">
      <p style="margin:0 0 4px;color:#6d28d9;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
        Next Step
      </p>
      <p style="margin:0;color:#4c1d95;font-size:15px;font-weight:600;">
        📅 Recruitment Interview
      </p>
    </div>
    """
    return _html_wrapper(content, f"Interview Invitation – {offer_title}")


# ── Rejection email (full plan) ────────────────────────────────────────────────

def build_rejection_email(
    candidate_name: str,
    offer_title: str,
    plan: dict,
    custom_message: str = "",
) -> str:
    """
    Renders a detailed rejection email using the full AI improvement plan.
    plan keys used: summary, priority_skills, learning_path, certifications,
                    soft_skills, timeline, encouragement.
    """

    priority_skills  = plan.get("priority_skills") or []
    learning_path    = plan.get("learning_path")   or []
    certifications   = plan.get("certifications")  or []
    soft_skills      = plan.get("soft_skills")     or []
    timeline         = plan.get("timeline", "3–6 months")
    encouragement    = plan.get("encouragement", "Keep going — every step forward counts!")
    summary          = plan.get("summary", "")

    # ── Priority skill pills ───────────────────────────────────────────────────
    skills_html = "".join(
        f'<span style="display:inline-block;background:#eef2ff;color:#4f46e5;'
        f'border:1px solid #c7d2fe;border-radius:20px;padding:5px 14px;'
        f'font-size:12px;font-weight:700;margin:3px 4px;">'
        f'{i + 1}. {s}</span>'
        for i, s in enumerate(priority_skills[:6])
    )

    # ── Learning path cards ────────────────────────────────────────────────────
    learning_html = ""
    for item in learning_path[:4]:
        skill    = item.get("skill", "")
        why      = item.get("why", "")
        project  = item.get("project", "")
        resources = item.get("resources") or []

        resources_rows = ""
        for res in resources[:4]:
            rtype    = res.get("type", "cours").lower()
            rname    = res.get("name", "")
            platform = res.get("platform", "")
            duration = res.get("duration", "")
            url_hint = res.get("url_hint", "")
            icon     = _RESOURCE_ICONS.get(rtype, "🔗")

            resources_rows += f"""
            <tr>
              <td style="padding:7px 0;border-bottom:1px solid #f0e6ff;vertical-align:top;">
                <span style="font-size:14px;">{icon}</span>
              </td>
              <td style="padding:7px 8px;border-bottom:1px solid #f0e6ff;vertical-align:top;">
                <span style="font-size:12px;font-weight:700;color:#1e293b;">{rname}</span>
                {"<br><span style='font-size:11px;color:#7c3aed;font-weight:600;'>" + platform + "</span>" if platform else ""}
                {"<span style='font-size:11px;color:#94a3b8;'> · " + url_hint + "</span>" if url_hint and platform else ""}
              </td>
              <td style="padding:7px 0;border-bottom:1px solid #f0e6ff;vertical-align:top;text-align:right;white-space:nowrap;">
                <span style="font-size:11px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:20px;">{duration}</span>
              </td>
            </tr>"""

        project_html = ""
        if project:
            project_html = f"""
            <div style="margin-top:12px;background:#ede9fe;border-radius:8px;padding:10px 14px;">
              <span style="font-size:12px;font-weight:700;color:#5b21b6;">🛠 Hands-on project:</span>
              <p style="margin:4px 0 0;font-size:12px;color:#4c1d95;line-height:1.5;">{project}</p>
            </div>"""

        learning_html += f"""
        <div style="margin-bottom:14px;border:1px solid #ddd6fe;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:12px 18px;">
            <span style="color:white;font-size:14px;font-weight:800;">{skill}</span>
          </div>
          <div style="padding:14px 18px;background:#faf5ff;">
            {"<p style='margin:0 0 10px;font-size:12px;color:#6b21a8;line-height:1.5;'><strong>💡 Why?</strong> " + why + "</p>" if why else ""}
            <table width="100%" cellpadding="0" cellspacing="0">
              {resources_rows}
            </table>
            {project_html}
          </div>
        </div>"""

    # ── Certifications ─────────────────────────────────────────────────────────
    certs_html = ""
    if certifications:
        cert_rows = ""
        for cert in certifications[:5]:
            cname    = cert.get("name", "")
            platform = cert.get("platform", "")
            relevance = cert.get("relevance", "")
            cert_rows += f"""
            <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #d1fae5;">
              <span style="font-size:16px;flex-shrink:0;">🏆</span>
              <div>
                <p style="margin:0;font-size:13px;font-weight:700;color:#064e3b;">{cname}</p>
                {"<p style='margin:2px 0 0;font-size:11px;color:#059669;font-weight:600;'>" + platform + "</p>" if platform else ""}
                {"<p style='margin:3px 0 0;font-size:11px;color:#065f46;line-height:1.4;'>" + relevance + "</p>" if relevance else ""}
              </div>
            </div>"""

        certs_html = f"""
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="margin:0 0 14px;font-size:14px;font-weight:800;color:#065f46;">
            🏆 Recommended Certifications
          </p>
          {cert_rows}
        </div>"""

    # ── Soft skills ────────────────────────────────────────────────────────────
    soft_html = ""
    if soft_skills:
        pills = "".join(
            f'<span style="display:inline-block;background:#fef9c3;color:#713f12;border:1px solid #fde68a;'
            f'border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;margin:2px;">{s}</span>'
            for s in soft_skills[:6]
        )
        soft_html = f"""
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#713f12;">💡 Soft Skills to Develop</p>
          <div>{pills}</div>
        </div>"""

    # ── Summary block ──────────────────────────────────────────────────────────
    summary_html = ""
    if summary:
        summary_html = f"""
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">
            🔍 Profile Analysis
          </p>
          <p style="margin:0;color:#1e3a8a;font-size:13px;line-height:1.7;">{summary}</p>
        </div>"""

    # ── Assemble full email ────────────────────────────────────────────────────
    content = f"""
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:22px;font-weight:800;">
      Hello {candidate_name},
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Thank you for applying for the position of
      <strong style="color:#4f46e5;">{offer_title}</strong>.
    </p>

    <!-- Result box -->
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:18px;">📋</p>
      <strong style="color:#9a3412;font-size:15px;">Application Result</strong>
      <p style="margin:8px 0 0;color:#9a3412;font-size:13px;line-height:1.6;">
        After reviewing your profile, your application does not yet fully meet all the
        requirements for this position. However, we have prepared a personalized development
        plan to help you reach this goal in the future.
      </p>
    </div>

    {f'<div style="background:#f8fafc;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;"><p style="margin:0;color:#334155;font-size:13px;line-height:1.6;">{custom_message}</p></div>' if custom_message else ''}

    {summary_html}

    <!-- Priority skills -->
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:#4c1d95;">
        🎯 Priority Skills to Develop
      </p>
      <div style="margin-bottom:14px;">{skills_html if skills_html else '<span style="color:#94a3b8;font-size:13px;">No specific skills identified.</span>'}</div>

      <!-- Timeline bar -->
      <div style="background:white;border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:12px;">
        <div style="text-align:center;min-width:64px;">
          <div style="font-size:16px;font-weight:900;color:#4f46e5;">{timeline}</div>
          <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
            estimated
          </div>
        </div>
        <div style="width:1px;height:36px;background:#e2e8f0;"></div>
        <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
          A detailed learning plan with courses, certifications, and hands-on projects
          has been generated for you by our AI system below.
        </p>
      </div>
    </div>

    <!-- Detailed learning path -->
    {"<p style='margin:0 0 14px;font-size:15px;font-weight:800;color:#1e293b;'>📚 Your Personalized Learning Path</p>" + learning_html if learning_html else ""}

    {certs_html}
    {soft_html}

    <!-- Encouragement -->
    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:12px;padding:24px;text-align:center;margin-top:8px;">
      <span style="font-size:24px;">💪</span>
      <p style="margin:10px 0 0;color:#c4b5fd;font-size:13px;font-style:italic;line-height:1.7;">
        "{encouragement}"
      </p>
    </div>
    """
    return _html_wrapper(content, f"Application Result – {offer_title}")


# ── Custom email ───────────────────────────────────────────────────────────────

def build_custom_email(candidate_name: str, offer_title: str, message: str) -> str:
    content = f"""
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:800;">
      Hello {candidate_name},
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Regarding your application for <strong style="color:#4f46e5;">{offer_title}</strong>:
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.8;">{message}</p>
    </div>
    """
    return _html_wrapper(content, f"Message – {offer_title}")


# ── SMTP sender ────────────────────────────────────────────────────────────────

def send_email(smtp_email: str, smtp_password: str, to: str, subject: str, html_body: str) -> dict:
    """Send HTML email via Gmail SMTP. Returns {'success': bool, 'error': str|None}."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"SkillsMatcher Pro <{smtp_email}>"
        msg["To"]      = to
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to, msg.as_string())

        return {"success": True, "error": None}
    except smtplib.SMTPAuthenticationError:
        return {"success": False, "error": "Gmail authentication failed. Check your App Password."}
    except Exception as e:
        return {"success": False, "error": str(e)}

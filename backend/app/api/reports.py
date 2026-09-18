"""PDF report generation (ReportLab)."""
from io import BytesIO
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib import colors

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import Farm, Plot, SoilTest, User
from app.services.soil_service import compute_soil_health

router = APIRouter(prefix="/reports", tags=["reports"])


def _footer_style():
    styles = getSampleStyleSheet()
    return styles


@router.get("/farm/{farm_id}")
def farm_report(farm_id: int, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(404, "Farm not found")

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _footer_style()
    story = []
    story.append(Paragraph(f"<b>AgriIntel-X Farm Report</b>", styles["Title"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().isoformat()} UTC", styles["Normal"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(f"Farm: <b>{farm.name}</b>", styles["Heading2"]))
    story.append(Paragraph(f"Village: {farm.village or '—'}", styles["Normal"]))
    story.append(Paragraph(f"District: {farm.district or '—'}", styles["Normal"]))
    story.append(Paragraph(f"State: {farm.state}", styles["Normal"]))
    story.append(Paragraph(f"Total area: {farm.total_area_ha} ha", styles["Normal"]))
    story.append(Paragraph(f"Soil type: {farm.soil_type or '—'}", styles["Normal"]))
    story.append(Paragraph(f"Irrigation: {farm.irrigation_type or '—'}", styles["Normal"]))
    story.append(Spacer(1, 0.5 * cm))

    plots = db.query(Plot).filter(Plot.farm_id == farm.id).all()
    if plots:
        story.append(Paragraph("Plots", styles["Heading3"]))
        data = [["Plot", "Area (ha)", "Soil", "Irrigation"]]
        for p in plots:
            data.append([p.name, str(p.area_ha), p.soil_type or "—", p.irrigation_type or "—"])
        t = Table(data, hAlign="LEFT")
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f5132")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ]))
        story.append(t)

        # Latest soil test per plot
        story.append(Spacer(1, 0.5 * cm))
        story.append(Paragraph("Latest Soil Health", styles["Heading3"]))
        for p in plots:
            latest = (db.query(SoilTest).filter(SoilTest.plot_id == p.id)
                      .order_by(SoilTest.test_date.desc()).first())
            if latest:
                health = compute_soil_health(latest)
                story.append(Paragraph(
                    f"Plot <b>{p.name}</b>: Score {health['score']}/100 ({health['status']})",
                    styles["Normal"]
                ))

    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("<b>Disclaimer</b>", styles["Heading4"]))
    story.append(Paragraph(
        "AI-generated agricultural recommendations are decision-support tools and should be "
        "validated with qualified agricultural experts / local extension services.",
        styles["Normal"]
    ))

    doc.build(story)
    buf.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=agriintel_farm_{farm_id}.pdf"}
    return StreamingResponse(buf, media_type="application/pdf", headers=headers)

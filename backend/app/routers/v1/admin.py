from fastapi import APIRouter, Depends

from app.alerts.recommendations import budget_anomaly_hint
from app.auth.rbac import require_roles
from app.database.mongodb import get_database

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/budget-anomalies")
async def budget_anomalies(_: dict = Depends(require_roles("government_admin", "super_admin"))) -> list[dict]:
    db = get_database()
    budgets = [item async for item in db.budgets.find({}, {"_id": 0})]

    output: list[dict] = []
    for budget in budgets:
        output.append(
            {
                **budget,
                "utilization_percent": round((budget["spent_crore"] / budget["allocated_crore"]) * 100, 1),
                "ai_hint": budget_anomaly_hint(budget["allocated_crore"], budget["spent_crore"]),
            }
        )

    return output


@router.get("/transparency")
async def public_transparency_dashboard() -> dict:
    db = get_database()
    roads_count = await db.roads.count_documents({})
    complaints_count = await db.complaints.count_documents({})
    resolved_count = await db.complaints.count_documents({"status": "Resolved"})
    return {
        "roads_monitored": roads_count,
        "complaints_registered": complaints_count,
        "complaints_resolved": resolved_count,
        "citizen_engagement_score": round((complaints_count / max(roads_count, 1)) * 10, 1),
    }

from app.repositories.analytics_repository import AnalyticsRepository


class AnalyticsService:
    def __init__(self, repository: AnalyticsRepository) -> None:
        self.repository = repository

    async def summary(self) -> dict:
        data = await self.repository.summary()
        if not data:
            return {
                "roads_monitored": 0,
                "avg_quality_score": 0,
                "active_complaints": 0,
                "sanctioned_budget_crore": 0,
                "amount_spent_crore": 0,
                "critical_roads": 0,
                "budget_utilization_percent": 0,
            }

        budget = float(data.get("sanctioned_budget_crore", 0) or 0)
        spent = float(data.get("amount_spent_crore", 0) or 0)
        utilization = round((spent / budget) * 100, 1) if budget else 0

        return {
            "roads_monitored": data.get("roads_monitored", 0),
            "avg_quality_score": round(float(data.get("avg_quality_score", 0) or 0), 1),
            "active_complaints": data.get("active_complaints", 0),
            "sanctioned_budget_crore": round(budget, 2),
            "amount_spent_crore": round(spent, 2),
            "critical_roads": data.get("critical_roads", 0),
            "budget_utilization_percent": utilization,
        }

    async def contractor_scores(self) -> list[dict]:
        return await self.repository.contractor_scores()

    async def monthly_trends(self) -> list[dict]:
        return await self.repository.monthly_trends()

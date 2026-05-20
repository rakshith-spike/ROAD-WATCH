from app.database.mongodb import get_database
from app.repositories.alert_repository import AlertRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.road_repository import RoadRepository
from app.repositories.user_repository import UserRepository
from app.services.alert_service import AlertService
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import AuthService
from app.services.complaint_service import ComplaintService
from app.services.road_service import RoadService


def get_road_service() -> RoadService:
    db = get_database()
    return RoadService(RoadRepository(db))


def get_complaint_service() -> ComplaintService:
    db = get_database()
    return ComplaintService(ComplaintRepository(db), RoadRepository(db))


def get_analytics_service() -> AnalyticsService:
    db = get_database()
    return AnalyticsService(AnalyticsRepository(db))


def get_auth_service() -> AuthService:
    db = get_database()
    return AuthService(UserRepository(db))


def get_alert_service() -> AlertService:
    db = get_database()
    return AlertService(AlertRepository(db))

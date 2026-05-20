from fastapi import APIRouter

from app.routers.v1.ai import chat as v1_chat
from app.routers.v1.ai import analyze_image as v1_analyze_image
from app.routers.v1.analytics import contractor_scores as v1_contractor_scores
from app.routers.v1.analytics import summary as v1_summary
from app.routers.v1.complaints import create_complaint as v1_create_complaint
from app.routers.v1.complaints import list_complaints as v1_list_complaints
from app.routers.v1.roads import get_road as v1_get_road
from app.routers.v1.roads import list_roads as v1_list_roads

router = APIRouter(tags=["legacy"])

router.add_api_route("/roads", v1_list_roads, methods=["GET"])
router.add_api_route("/roads/{road_id}", v1_get_road, methods=["GET"])
router.add_api_route("/complaints", v1_list_complaints, methods=["GET"])
router.add_api_route("/complaints", v1_create_complaint, methods=["POST"], status_code=201)
router.add_api_route("/analytics/summary", v1_summary, methods=["GET"])
router.add_api_route("/analytics/contractors", v1_contractor_scores, methods=["GET"])
router.add_api_route("/ai/chat", v1_chat, methods=["POST"])
router.add_api_route("/ai/analyze-image", v1_analyze_image, methods=["POST"])

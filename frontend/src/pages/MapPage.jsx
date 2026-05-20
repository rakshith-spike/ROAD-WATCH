import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { SectionHeading } from "../components/common/SectionHeading";
import { SmartCityMap } from "../components/map/SmartCityMap";
import { PageTransition } from "../components/common/PageTransition";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

export default function MapPage() {
  const { roads } = usePlatform();
  const [selectedRoad, setSelectedRoad] = useState(roads[0] || null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nearbyIssues, setNearbyIssues] = useState([]);

  const filteredRoads = useMemo(() => {
    if (statusFilter === "all") return roads;
    return roads.filter((road) => road.status === statusFilter);
  }, [roads, statusFilter]);

  async function checkNearby(road) {
    try {
      const result = await api.getNearbyIssues(road.center.lat, road.center.lng, 4);
      setNearbyIssues(result);
    } catch {
      toast.error("Nearby issue detection unavailable");
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Geospatial Intelligence"
          title="Live Map Monitoring, Severity Heatmaps, and Clustered Issue Zones"
          description="Filter roads by condition, monitor emergency hotspots, and drill into contractor accountability from map context."
        />

        <div className="flex flex-wrap gap-2">
          {["all", "good", "moderate", "critical", "construction"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusFilter === status ? "bg-ink-900 text-white dark:bg-mint-600 dark:text-slate-950" : "bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
            >
              {status}
            </button>
          ))}
        </div>

        <SmartCityMap
          roads={filteredRoads}
          selectedRoad={selectedRoad}
          onSelectRoad={(road) => {
            setSelectedRoad(road);
            checkNearby(road);
          }}
          nearbyIssues={nearbyIssues}
        />
      </div>
    </PageTransition>
  );
}

import { useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

const STATUS_COLOR = {
  good: "#29d8b0",
  moderate: "#f7bf45",
  critical: "#f75546",
  construction: "#7f8ea3",
};

const hazardIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#f75546;color:white;border-radius:999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid white;">!</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const userIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#2463eb;border-radius:999px;width:20px;height:20px;border:3px solid white;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function buildClusters(roads) {
  const buckets = new Map();
  roads.forEach((road) => {
    const lat = road.center.lat;
    const lng = road.center.lng;
    const key = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const current = buckets.get(key);
    if (current) {
      current.count += 1;
      current.roads.push(road.name);
      current.lat = (current.lat + lat) / 2;
      current.lng = (current.lng + lng) / 2;
    } else {
      buckets.set(key, { lat, lng, count: 1, roads: [road.name] });
    }
  });

  return [...buckets.values()].filter((item) => item.count > 1);
}

export function SmartCityMap({ roads, selectedRoad, onSelectRoad, nearbyIssues }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationMsg, setLocationMsg] = useState("");

  const clusters = useMemo(() => buildClusters(roads), [roads]);

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationMsg("Geolocation not supported.");
      return;
    }
    setLocationMsg("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationMsg("Location captured.");
      },
      () => setLocationMsg("Location permission denied."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  return (
    <div className="glass-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Smart GIS Road Monitoring</h3>
        <button
          type="button"
          onClick={locateMe}
          className="rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint-600 dark:text-slate-950"
        >
          Live Geolocation
        </button>
      </div>

      <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-[560px] rounded-2xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates.map((point) => [point.lat, point.lng])}
            pathOptions={{ color: STATUS_COLOR[road.status], weight: selectedRoad?.id === road.id ? 10 : 6, opacity: 0.85 }}
            eventHandlers={{ click: () => onSelectRoad(road) }}
          />
        ))}

        {roads.map((road) => (
          <Circle
            key={`${road.id}-heat`}
            center={[road.center.lat, road.center.lng]}
            pathOptions={{
              color: "transparent",
              fillColor: STATUS_COLOR[road.status],
              fillOpacity: road.status === "critical" ? 0.25 : 0.13,
            }}
            radius={road.status === "critical" ? 450 : 270}
          />
        ))}

        {roads.map((road) => (
          <CircleMarker
            key={`${road.id}-point`}
            center={[road.center.lat, road.center.lng]}
            radius={selectedRoad?.id === road.id ? 8 : 5}
            pathOptions={{ color: "#fff", fillColor: STATUS_COLOR[road.status], fillOpacity: 1, weight: 2 }}
            eventHandlers={{ click: () => onSelectRoad(road) }}
          >
            <Popup>
              <strong>{road.name}</strong>
              <br />
              Score: {road.quality_score}/100
              <br />
              Complaints: {road.complaints}
            </Popup>
          </CircleMarker>
        ))}

        {clusters.map((cluster, idx) => (
          <CircleMarker
            key={`cluster-${idx}`}
            center={[cluster.lat, cluster.lng]}
            radius={10 + cluster.count}
            pathOptions={{ color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <strong>{cluster.count} nearby issue clusters</strong>
              <br />
              {cluster.roads.join(", ")}
            </Popup>
          </CircleMarker>
        ))}

        {selectedRoad ? <Marker position={[selectedRoad.center.lat, selectedRoad.center.lng]} icon={hazardIcon} /> : null}
        {userLocation ? <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} /> : null}
      </MapContainer>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{locationMsg || "Filter by severity and monitor emerging zones."}</p>

      {nearbyIssues.length > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10">
          <p className="font-semibold text-slate-900 dark:text-white">Nearby issue detection</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{nearbyIssues[0].name} is {nearbyIssues[0].distance_km} km from your selected point.</p>
        </div>
      ) : null}
    </div>
  );
}

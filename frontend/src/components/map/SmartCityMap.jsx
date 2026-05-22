import { useMemo } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const CONDITION_COLOR = {
  good: "#31d49f",
  moderate: "#f4c14f",
  critical: "#f75546",
  under_construction: "#f68f3c",
};

const criticalIcon = new L.DivIcon({
  className: "critical-pulse-icon",
  html: '<div class="critical-pulse-dot">!</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const userIcon = new L.DivIcon({
  className: "user-pulse-icon",
  html: '<div class="user-pulse-dot"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FlyToUserLocation({ userLocation }) {
  const map = useMap();
  if (userLocation) {
    map.flyTo([userLocation.lat, userLocation.lng], 14, {
      animate: true,
      duration: 1.2,
    });
  }
  return null;
}

function buildMarkerClusters(roads) {
  const buckets = new Map();
  roads.forEach((road) => {
    const key = `${road.latitude.toFixed(2)}_${road.longitude.toFixed(2)}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        lat: road.latitude,
        lng: road.longitude,
        count: 0,
        roads: [],
        maxSeverity: 0,
      });
    }
    const bucket = buckets.get(key);
    bucket.count += 1;
    bucket.maxSeverity = Math.max(bucket.maxSeverity, road.severityScore);
    bucket.roads.push(road.roadName);
  });
  return [...buckets.values()].filter((item) => item.count > 1);
}

function getTileUrl(layerMode) {
  if (layerMode === "satellite") {
    return "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
  }
  if (layerMode === "traffic") {
    return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  }
  if (layerMode === "weather") {
    return "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png";
  }
  return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
}

export function SmartCityMap({
  roads,
  wards,
  selectedRoad,
  onSelectRoad,
  userLocation,
  nearbyRoads,
  layerMode,
  showWardOverlay,
  showHeatmap,
}) {
  const clusters = useMemo(() => buildMarkerClusters(roads), [roads]);

  return (
    <div className="glass-panel">
      <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-[630px] rounded-2xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={getTileUrl(layerMode)}
        />

        <FlyToUserLocation userLocation={userLocation} />

        {showWardOverlay
          ? wards.map((ward) => (
              <Polygon
                key={ward.ward}
                positions={ward.boundary}
                pathOptions={{
                  color: "#68d6bf",
                  weight: 1,
                  fillOpacity: 0.05,
                }}
              >
                <Popup>
                  <strong>{ward.ward}</strong>
                  <br />
                  Zone: {ward.zone}
                </Popup>
              </Polygon>
            ))
          : null}

        {roads.map((road) => (
          <Polyline
            key={`line-${road.roadId}`}
            positions={road.coordinates}
            pathOptions={{
              color: CONDITION_COLOR[road.roadCondition],
              weight: selectedRoad?.roadId === road.roadId ? 9 : 5,
              opacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelectRoad(road) }}
          />
        ))}

        {showHeatmap
          ? roads.map((road) => (
              <Circle
                key={`heat-${road.roadId}`}
                center={[road.latitude, road.longitude]}
                radius={road.severityScore * 7 + 110}
                pathOptions={{
                  color: "transparent",
                  fillColor: CONDITION_COLOR[road.roadCondition],
                  fillOpacity: road.roadCondition === "critical" ? 0.26 : 0.14,
                }}
              />
            ))
          : null}

        {roads.map((road) => (
          <CircleMarker
            key={road.roadId}
            center={[road.latitude, road.longitude]}
            radius={selectedRoad?.roadId === road.roadId ? 8 : 5.5}
            pathOptions={{
              color: "#fff",
              fillColor: CONDITION_COLOR[road.roadCondition],
              fillOpacity: 1,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelectRoad(road) }}
          >
            <Popup className="road-popup">
              <div style={{fontFamily:"system-ui,sans-serif",minWidth:"180px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"6px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:CONDITION_COLOR[road.roadCondition],boxShadow:`0 0 6px ${CONDITION_COLOR[road.roadCondition]}`}} />
                  <p style={{margin:0,fontWeight:700,fontSize:"12px",color:"#0f172a"}}>{road.roadName}</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px",fontSize:"10px",color:"#64748b"}}>
                  <span>Ward: <b style={{color:"#334155"}}>{road.ward}</b></span>
                  <span>Score: <b style={{color:road.severityScore>70?"#ef4444":road.severityScore>40?"#f59e0b":"#10b981"}}>{road.severityScore}/100</b></span>
                  <span>Priority: <b style={{color:"#334155"}}>{road.maintenancePriority}</b></span>
                  <span>Risk: <b style={{color:"#334155"}}>{road.predictedFailureRisk}</b></span>
                </div>
                <div style={{marginTop:"6px",padding:"4px 8px",background:"#f8fafc",borderRadius:"6px",fontSize:"10px",color:"#64748b"}}>{road.contractorName}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {clusters.map((cluster, idx) => (
          <CircleMarker
            key={`cluster-${idx}`}
            center={[cluster.lat, cluster.lng]}
            radius={10 + cluster.count}
            pathOptions={{
              color: cluster.maxSeverity > 80 ? "#f75546" : "#2563eb",
              fillColor: cluster.maxSeverity > 80 ? "#ff9588" : "#60a5fa",
              fillOpacity: 0.72,
              weight: 2,
            }}
          >
            <Popup>
              <p className="text-sm font-semibold">{cluster.count} roads clustered</p>
              <p className="text-xs">Peak severity: {cluster.maxSeverity}</p>
              <p className="text-xs">{cluster.roads.slice(0, 4).join(", ")}</p>
            </Popup>
          </CircleMarker>
        ))}

        {roads
          .filter((road) => road.roadCondition === "critical" && road.severityScore >= 85)
          .slice(0, 20)
          .map((road) => (
            <Marker key={`critical-${road.roadId}`} position={[road.latitude, road.longitude]} icon={criticalIcon} />
          ))}

        {userLocation ? <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} /> : null}

        {nearbyRoads.slice(0, 5).map((road) => (
          <Circle
            key={`nearby-${road.roadId}`}
            center={[road.latitude, road.longitude]}
            radius={95}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.22 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

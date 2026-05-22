// FIX: default to 127.0.0.1 — matches what the browser actually uses locally.
// To deploy, set VITE_API_BASE_URL in your frontend .env file.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Single V1 constant — no more scattered /api/v1 strings across the file.
const V1 = `${API_BASE}/api/v1`;

function getAuthHeaders() {
  const token = localStorage.getItem("rw_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function post(url, payload) {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function patch(url, payload) {
  return request(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export const api = {
  // Health
  health: () => request(`${API_BASE}/health`),

  // Auth
  signup:  (payload)       => post(`${V1}/auth/signup`, payload),
  login:   (payload)       => post(`${V1}/auth/login`, payload),
  refresh: (refreshToken)  => post(`${V1}/auth/refresh`, { refresh_token: refreshToken }),

  // Roads
  getRoads:    (params = "") => request(`${V1}/roads${params}`),
  getRoadById: (roadId)      => request(`${V1}/roads/${roadId}`),
  updateRoad:  (roadId, payload) => patch(`${V1}/roads/${roadId}`, payload),

  // Complaints
  getComplaints:   ()        => request(`${V1}/complaints`),
  createComplaint: (payload) => post(`${V1}/complaints`, payload),
  triggerSos:      ()        => request(`${V1}/complaints/sos/emergency`),

  // Analytics
  getSummary:       () => request(`${V1}/analytics/summary`),
  getContractors:   () => request(`${V1}/analytics/contractors`),
  getMonthlyTrends: () => request(`${V1}/analytics/monthly-trends`),
  getRiskCards:     () => request(`${V1}/analytics/risk-cards`),

  // AI
  askAi:        (payload)  => post(`${V1}/ai/chat`, payload),
  analyzeImage: (formData) => request(`${V1}/ai/analyze-image`, { method: "POST", body: formData }),

  // Alerts
  getAlerts: () => request(`${V1}/alerts`),
  createAlert: (payload) => post(`${V1}/alerts`, payload),

  // Contractors
  getContractorProfiles: () => request(`${V1}/contractors`),

  // Admin
  getTransparency:    () => request(`${V1}/admin/transparency`),
  getBudgetAnomalies: () => request(`${V1}/admin/budget-anomalies`),

  // Geospatial
  getNearbyIssues: (lat, lng, radiusKm = 3) =>
    request(`${V1}/geospatial/nearby-issues?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),

  // Intelligence mock APIs (backend-powered demo data)
  getIntelligenceSnapshot: (limit = 120) => request(`${V1}/intelligence/snapshot?limit=${limit}`),
  getIntelligenceRoads: (limit = 120) => request(`${V1}/intelligence/roads?limit=${limit}`),
  getIntelligenceAlerts: ({ limit = 90, severity = "" } = {}) =>
    request(`${V1}/intelligence/alerts?limit=${limit}${severity ? `&severity=${encodeURIComponent(severity)}` : ""}`),
};

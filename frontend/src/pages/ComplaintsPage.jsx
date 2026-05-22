import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, MapPin, Upload, Wand2 } from "lucide-react";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

const emptyForm = (roadId = "") => ({
  road_id: roadId,
  citizen_name: "AI Photo Reporter",
  phone: "0000000000",
  issue_type: "",
  description: "",
  latitude: "",
  longitude: "",
  severity: "",
  priority: "",
  location_name: "",
  area: "",
  ward_name: "",
  road_name: "",
  district: "",
  city: "",
  state: "",
  captured_date: "",
  captured_time: "",
  captured_timestamp: "",
  gps_source: "device",
  ai_recommended_action: "",
});

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const { roads, refresh } = usePlatform();
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [imageName, setImageName] = useState("");
  const [locationStatus, setLocationStatus] = useState("Location not captured yet");
  const [form, setForm] = useState(emptyForm(roads[0]?.id || ""));
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const selectedRoad = useMemo(() => roads.find((item) => item.id === form.road_id) || roads[0], [roads, form.road_id]);
  const hasLocation = form.latitude !== "" && form.longitude !== "";

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function locationHelpMessage() {
    if (!window.isSecureContext) {
      return "Location is blocked on insecure mobile links. Test on laptop localhost, or use HTTPS for phone testing.";
    }
    return "Please allow location access in the browser popup.";
  }

  async function readDeviceLocation() {
    if (!navigator.geolocation) {
      throw new Error("Location is not supported by this browser");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          const message = error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Enable it from browser site settings and retry."
            : "Could not get current location. Turn on device location and retry.";
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
  }

  async function captureLocation() {
    setLocating(true);
    setLocationStatus(locationHelpMessage());
    try {
      const { latitude, longitude } = await readDeviceLocation();
      setForm((current) => ({
        ...current,
        latitude: String(latitude),
        longitude: String(longitude),
        gps_source: "device",
      }));
      setLocationStatus(`Using device location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      return { latitude, longitude };
    } catch (error) {
      const message = error.message || locationHelpMessage();
      setLocationStatus(message);
      toast.error(message);
      return null;
    } finally {
      setLocating(false);
    }
  }

  function applyDraft(result, existingLocation = null) {
    const latitude = result.location.latitude ?? existingLocation?.latitude ?? "";
    const longitude = result.location.longitude ?? existingLocation?.longitude ?? "";
    setDraft(result);
    setForm((current) => ({
      ...current,
      road_id: result.road_id,
      citizen_name: "AI Photo Reporter",
      phone: "0000000000",
      issue_type: result.complaint_type,
      description: result.generated_description,
      latitude: latitude === "" ? "" : String(latitude),
      longitude: longitude === "" ? "" : String(longitude),
      severity: result.severity,
      priority: result.priority,
      location_name: result.location.place_name,
      area: result.location.area,
      ward_name: result.location.ward_name,
      road_name: result.location.road_name,
      district: result.location.district,
      city: result.location.city,
      state: result.location.state,
      captured_date: result.metadata.date,
      captured_time: result.metadata.time,
      captured_timestamp: result.metadata.timestamp,
      gps_source: latitude === "" || longitude === "" ? "missing" : "device",
      ai_recommended_action: result.recommended_action,
    }));
  }

  function clearGeneratedDraft() {
    setDraft(null);
    setForm((current) => ({
      ...emptyForm(current.road_id || roads[0]?.id || ""),
      latitude: current.latitude,
      longitude: current.longitude,
      gps_source: current.gps_source,
    }));
  }

  async function analyzePhoto(file) {
    if (!file) return;

    setAnalyzing(true);
    clearGeneratedDraft();
    setImageName(file.name || "Captured road image");
    setLocationStatus("Trying to capture location, then analyzing image...");

    let location = null;
    try {
      location = await readDeviceLocation();
      setLocationStatus(`Using device location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    } catch (error) {
      setLocationStatus(error.message || "Location not captured. Image analysis will still continue.");
    }

    try {
      const payload = new FormData();
      payload.append("image", file);
      payload.append("road_id", form.road_id || roads[0]?.id || "");
      if (location) {
        payload.append("latitude", location.latitude);
        payload.append("longitude", location.longitude);
      }

      const result = await api.smartComplaintDraft(payload);
      applyDraft(result, location);
      toast.success(location ? "AI complaint draft generated" : "Image analyzed. Capture location before submitting.");
    } catch (error) {
      clearGeneratedDraft();
      setLocationStatus(error.message || "AI photo analysis failed");
      toast.error(error.message || "AI photo analysis failed");
    } finally {
      setAnalyzing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!localStorage.getItem("rw_access_token")) {
      toast.error("Please sign in before submitting a complaint");
      navigate("/auth", { state: { from: "/complaints" } });
      return;
    }
    if (!draft || !form.description) {
      toast.error("Upload a valid road-damage photo first");
      return;
    }
    if (!hasLocation) {
      toast.error("Capture current location before submitting");
      await captureLocation();
      return;
    }

    setSaving(true);
    try {
      await api.createComplaint({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      toast.success("Complaint submitted and routed");
      setForm(emptyForm(roads[0]?.id || ""));
      setDraft(null);
      setImageName("");
      setLocationStatus("Location not captured yet");
      refresh();
    } catch {
      toast.error("Complaint submission failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="AI Assistance"
          title="Smart Complaint Registration"
          description="Capture road damage once and let AI detect the issue, geo-tag it, generate the complaint, and route it."
        />

        <div className="w-full">
          <form className="glass-panel w-full space-y-5" onSubmit={submit}>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => analyzePhoto(event.target.files?.[0])} />
            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => analyzePhoto(event.target.files?.[0])} />

            <div className="grid gap-3 md:grid-cols-3">
              <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={analyzing} className="flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-mint-600 dark:text-slate-950">
                <Camera size={18} />
                {analyzing ? "Analyzing..." : "Click Photo"}
              </button>
              <button type="button" onClick={() => uploadInputRef.current?.click()} disabled={analyzing} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-60 dark:border-white/10">
                <Upload size={18} />
                Upload Image
              </button>
              <button type="button" onClick={captureLocation} disabled={locating} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-60 dark:border-white/10">
                <MapPin size={18} />
                {locating ? "Locating..." : "Get Location"}
              </button>
            </div>

            {imageName && <p className="text-xs text-slate-500 dark:text-slate-400">Image: {imageName}</p>}
            <p className={`text-xs font-medium ${hasLocation ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}`}>{locationStatus}</p>

            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={form.road_id} onChange={(event) => update("road_id", event.target.value)} disabled={analyzing}>
              {roads.map((road) => (
                <option key={road.id} value={road.id}>{road.name} - {road.section}</option>
              ))}
            </select>

            <div className="grid gap-3 md:grid-cols-4">
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Complaint Type" value={form.issue_type} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Severity" value={form.severity} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Priority" value={form.priority} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Time" value={form.captured_time} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Date" value={form.captured_date} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Location" value={form.location_name} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={selectedRoad?.center.lat} value={form.latitude} readOnly />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={selectedRoad?.center.lng} value={form.longitude} readOnly />
            </div>

            <textarea className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" rows={10} placeholder="AI generated complaint will appear here after photo analysis" value={form.description} readOnly required />

            {draft && (
              <div className="rounded-xl border border-mint-200 bg-mint-50 p-3 text-sm text-slate-700 dark:border-mint-400/30 dark:bg-mint-400/10 dark:text-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Wand2 size={16} /> AI Draft Ready
                </div>
                <p className="mt-1">Confidence: {Math.round(draft.confidence * 100)}% - Mode: {draft.ai_mode}</p>
              </div>
            )}

            <button type="submit" disabled={saving || analyzing || !form.description} className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-mint-600 dark:text-slate-950">
              {saving ? "Submitting..." : hasLocation ? "Submit AI Generated Complaint" : "Get Location Before Submit"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

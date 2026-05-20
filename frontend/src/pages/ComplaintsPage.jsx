import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

export default function ComplaintsPage() {
  const { roads, complaints, refresh } = usePlatform();
  const [saving, setSaving] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [form, setForm] = useState({
    road_id: roads[0]?.id || "",
    citizen_name: "",
    phone: "",
    issue_type: "Pothole",
    description: "",
    latitude: "",
    longitude: "",
  });

  const selectedRoad = useMemo(() => roads.find((item) => item.id === form.road_id) || roads[0], [roads, form.road_id]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startVoiceCapture() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("Voice capture unsupported in this browser");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceEnabled(true);
    recognition.start();
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      update("description", `${form.description} ${spokenText}`.trim());
      toast.success("Voice note added to complaint description");
    };
    recognition.onerror = () => toast.error("Could not capture voice note");
    recognition.onend = () => setVoiceEnabled(false);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.createComplaint({
        road_id: form.road_id,
        citizen_name: form.citizen_name,
        phone: form.phone,
        issue_type: form.issue_type,
        description: form.description,
        latitude: Number(form.latitude || selectedRoad?.center.lat || 0),
        longitude: Number(form.longitude || selectedRoad?.center.lng || 0),
      });
      toast.success("Complaint submitted and routed");
      setForm({
        road_id: roads[0]?.id || "",
        citizen_name: "",
        phone: "",
        issue_type: "Pothole",
        description: "",
        latitude: "",
        longitude: "",
      });
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
          eyebrow="Citizen Reporting"
          title="Complaint Registration and Smart Routing"
          description="Capture issue reports with location details, optional voice notes, and AI-prioritized assignment flow."
        />

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <form className="glass-panel space-y-3" onSubmit={submit}>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={form.road_id} onChange={(event) => update("road_id", event.target.value)}>
              {roads.map((road) => (
                <option key={road.id} value={road.id}>{road.name} - {road.section}</option>
              ))}
            </select>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Citizen Name" value={form.citizen_name} onChange={(event) => update("citizen_name", event.target.value)} required />
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} required />
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={form.issue_type} onChange={(event) => update("issue_type", event.target.value)}>
              <option>Pothole</option>
              <option>Surface crack</option>
              <option>Water logging</option>
              <option>Accident risk</option>
              <option>Debris</option>
              <option>Faded markings</option>
            </select>
            <textarea className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} required />

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={selectedRoad?.center.lat} value={form.latitude} onChange={(event) => update("latitude", event.target.value)} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={selectedRoad?.center.lng} value={form.longitude} onChange={(event) => update("longitude", event.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={startVoiceCapture} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
                {voiceEnabled ? "Listening..." : "Voice Complaint Note"}
              </button>
              <button type="submit" disabled={saving} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint-600 dark:text-slate-950">
                {saving ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>

          <section className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Latest Complaints</h3>
            <div className="mt-4 space-y-3">
              {complaints.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.issue_type} · {item.ai_priority}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.status} → {item.assigned_to}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

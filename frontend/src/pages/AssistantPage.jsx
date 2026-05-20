import { useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

export default function AssistantPage() {
  const { roads } = usePlatform();
  const [roadId, setRoadId] = useState(roads[0]?.id || "");
  const [message, setMessage] = useState("Which road needs urgent intervention this week?");
  const [language, setLanguage] = useState("en");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAssistant() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const result = await api.askAi({ message, road_id: roadId || null, language });
      setAnswer(result.answer);
      toast.success(`AI response from ${result.mode}`);
    } catch {
      toast.error("Assistant service unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="AI Assistant"
          title="Multilingual Civic Co-pilot with Road Risk Intelligence"
          description="Ask for summaries, government alerts, contractor risk, and maintenance plans using contextual road intelligence."
        />

        <section className="glass-panel space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={roadId} onChange={(event) => setRoadId(event.target.value)}>
              <option value="">Entire city network</option>
              {roads.map((road) => (
                <option key={road.id} value={road.id}>{road.name} - {road.section}</option>
              ))}
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
            </select>
            <button type="button" onClick={askAssistant} disabled={loading} className="rounded-xl bg-ink-900 px-4 py-2 font-semibold text-white dark:bg-mint-600 dark:text-slate-950">
              {loading ? "Thinking..." : "Ask Assistant"}
            </button>
          </div>
          <textarea
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-mint-500 dark:border-white/10 dark:bg-white/5"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <pre className="min-h-52 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100">
            {answer || "AI response will appear here."}
          </pre>
        </section>
      </div>
    </PageTransition>
  );
}

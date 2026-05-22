import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { AlertTriangle, Bot, Landmark, MapPin, Send, Sparkles, UserRound, WalletCards, RefreshCw, Zap } from "lucide-react";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "Road Status", icon: MapPin, query: "Which roads need urgent intervention this week?" },
  { label: "Find Authority", icon: Landmark, query: "Who is responsible for the highest-risk corridor and what action should they take?" },
  { label: "Budget Risk", icon: WalletCards, query: "Show budget utilization and contractor accountability risks." },
  { label: "Citizen Advisory", icon: AlertTriangle, query: "Draft a public advisory for current critical road issues." },
];

// ─── Mock AI responses for offline/demo mode ─────────────────────────────────
const MOCK_RESPONSES = [
  {
    keywords: ["urgent", "critical", "intervention", "road"],
    answer: "Based on current road intelligence:\n\n🔴 MG Road Section 4 — Quality score 28/100, 14 active complaints. Requires emergency patching within 48h.\n\n🟠 Hosur Road KM 8 — Quality score 61/100, 7 complaints including surface cracking near Electronics City flyover.\n\n🟡 Outer Ring Road North — Score 74/100, 3 complaints. Preventive maintenance recommended.\n\nRecommendation: Deploy BBMP Zone 3 emergency team to MG Road immediately. Issue public advisory and barricade high-risk segments.",
    suggestions: ["Who is the contractor for MG Road?", "Show budget utilization for all roads", "What complaints are open right now?"],
  },
  {
    keywords: ["authority", "responsible", "highest-risk", "corridor"],
    answer: "Highest-risk corridor: MG Road Section 4\n\n👤 Authority: BBMP Zone 3\n🏗️ Contractor: RoadBuild Pvt Ltd\n📋 Quality Score: 28/100\n🚨 Active Complaints: 14\n💰 Budget: ₹2.4 Cr sanctioned, ₹1.9 Cr spent (79% utilized)\n\nRequired Action:\n• BBMP Zone 3 to issue emergency work order within 24h\n• RoadBuild Pvt Ltd to mobilize patching crew\n• Public advisory to be issued via BBMP app and SMS\n• Escalate to Commissioner if not resolved in 72h",
    suggestions: ["Show all contractor performance", "Draft a work order for BBMP Zone 3", "What is the complaint resolution rate?"],
  },
  {
    keywords: ["budget", "spending", "utilization", "contractor"],
    answer: "Budget & Contractor Analysis:\n\n💰 Budget Overview:\n• MG Road Sec 4: 79% utilized (₹1.9Cr/₹2.4Cr) — HIGH RISK of overrun\n• Hosur Road KM 8: 66% utilized (₹2.05Cr/₹3.1Cr) — On track\n• ORR North: 60% utilized (₹3.1Cr/₹5.2Cr) — Under budget\n\n⚠️ Accountability Flags:\n• RoadBuild Pvt Ltd: 14 open complaints, repeat failure patterns detected\n• InfraWorks Consortium: Performing adequately, 7 complaints\n• CivicGrid Builders: Best performer, 3 complaints\n\nRecommendation: Initiate performance review for RoadBuild Pvt Ltd. Consider contract penalty clauses.",
    suggestions: ["Show road quality trends", "Which contractor has best resolution rate?", "Flag overdue complaints"],
  },
  {
    keywords: ["advisory", "public", "citizen", "alert"],
    answer: "📢 Public Advisory — RoadWatch Bengaluru\n\nDate: " + new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) + "\n\n⚠️ Road Caution Notice\n\nDear Citizens of Bengaluru,\n\nBBMP Road Safety Command advises motorists to exercise caution on the following stretches:\n\n1. MG Road (Trinity Circle to Ulsoor) — Multiple potholes, reduced speed to 30 km/h\n2. Hosur Road near Electronics City — Surface cracking, avoid heavy vehicles\n\nEmergency repair teams deployed. Expected restoration: 72 hours.\n\nReport issues: RoadWatch App or BBMP Helpline 1533\nStay safe. Help us build a smarter Bengaluru.",
    suggestions: ["Send this to citizens via SMS", "Show real-time repair status", "Which roads are safe for heavy vehicles?"],
  },
];

function getMockResponse(message) {
  const lower = message.toLowerCase();
  for (const resp of MOCK_RESPONSES) {
    if (resp.keywords.some((kw) => lower.includes(kw))) {
      return resp;
    }
  }
  return {
    answer: `I'm RoadWatch AI in demo mode. Your query: "${message}"\n\nBased on available road data:\n\n• Total monitored roads: 12 across Bengaluru\n• Critical conditions: 3 roads (MG Road Sec 4 is worst at 28/100)\n• Open complaints: 24 active cases\n• Avg resolution time: 68 hours\n\nFor live AI responses powered by real-time data, connect the backend and configure a GROQ_API_KEY or GEMINI_API_KEY.\n\nAsk me about: road status, budgets, contractors, complaints, or citizen advisories.`,
    suggestions: ["Which road is most critical?", "Show contractor performance", "What complaints are pending?"],
  };
}

// ─── Typing animation component ───────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint-500/15 text-mint-700 dark:text-mint-300">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/40 bg-white/70 px-5 py-4 shadow-glass dark:border-white/10 dark:bg-white/5">
        {[0, 150, 300].map((delay) => (
          <motion.span
            key={delay}
            className="h-2 w-2 rounded-full bg-mint-500"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, onSuggestion }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const Icon = isUser ? UserRound : isError ? AlertTriangle : Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${isError ? "bg-rose-500/15 text-rose-600 dark:text-rose-300" : "bg-mint-500/15 text-mint-700 dark:text-mint-300"}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div className={`max-w-[86%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-glass ${
          isUser
            ? "rounded-tr-md bg-ink-900 text-white dark:bg-mint-500 dark:text-slate-950"
            : isError
              ? "rounded-tl-md border border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-200"
              : "rounded-tl-md border border-white/40 bg-white/70 text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
        }`}>
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line || "\u00A0"}</p>
          ))}
        </div>

        {message.mode && (
          <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Zap className="h-3 w-3" />
            {message.mode === "demo" ? "Demo mode" : message.mode === "fallback" ? "Fallback AI" : `AI: ${message.mode}`}
          </p>
        )}

        {message.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.suggestions.map((s) => (
              <button key={s} onClick={() => onSuggestion(s)}
                className="rounded-full border border-mint-300/50 bg-mint-400/10 px-3 py-1.5 text-xs font-bold text-mint-800 transition hover:bg-mint-400/20 dark:text-mint-200">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-300">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const { roads, usingMockData } = usePlatform();
  const [roadId, setRoadId] = useState("");
  const [language, setLanguage] = useState("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to RoadWatch AI — your civic co-pilot for Bengaluru's road intelligence.\n\nAsk me about road quality, contractor accountability, budget utilization, complaint routing, or generate citizen advisories. I'm here to help the city command center make smarter decisions.",
      suggestions: ["Which road is most critical right now?", "Summarize active complaints", "What should city command do today?"],
      mode: null,
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed, suggestions: [] }]);

    try {
      if (usingMockData) {
        // Demo mode: use local mock responses
        await new Promise((res) => setTimeout(res, 800 + Math.random() * 600));
        const mock = getMockResponse(trimmed);
        setMessages((prev) => [...prev, { role: "assistant", content: mock.answer, suggestions: mock.suggestions, mode: "demo" }]);
      } else {
        const result = await api.askAi({ message: trimmed, road_id: roadId || null, language });
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: result.answer || "No response received.",
          suggestions: result.suggestions || [],
          mode: result.mode,
        }]);
      }
    } catch (error) {
      // Fallback to mock even when live mode fails
      const mock = getMockResponse(trimmed);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `⚠️ Live AI unavailable. Showing demo response:\n\n${mock.answer}`,
        suggestions: mock.suggestions,
        mode: "fallback",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I help you with Bengaluru road intelligence today?",
      suggestions: ["Which road is most critical?", "Show budget risks", "Generate public advisory"],
      mode: null,
    }]);
    toast.success("Chat cleared");
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="AI Assistant"
            title="RoadWatch Civic Co-pilot"
            description="Chat with contextual road intelligence for risk analysis, budgets, contractor accountability, complaint routing, and smart-city recommendations."
          />
          {usingMockData && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> Demo Mode — configure GROQ_API_KEY for live AI
            </span>
          )}
        </div>

        <section className="glass-panel overflow-hidden p-0">
          {/* Header bar */}
          <div className="border-b border-white/40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white dark:border-white/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500/30 to-cyan-500/20 ring-2 ring-mint-500/30"
                  animate={{ boxShadow: ["0 0 0 0px rgba(49,212,159,0.3)", "0 0 0 8px rgba(49,212,159,0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-mint-300" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl font-bold">RoadWatch AI</h3>
                  <p className="text-sm text-slate-300">Monitor · Analyze · Advise · Route</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none backdrop-blur-xl" value={roadId} onChange={(e) => setRoadId(e.target.value)}>
                  <option className="text-slate-900" value="">Entire city network</option>
                  {roads.map((r) => <option className="text-slate-900" key={r.id} value={r.id}>{r.name} – {r.section}</option>)}
                </select>
                <select className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none backdrop-blur-xl" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option className="text-slate-900" value="en">English</option>
                  <option className="text-slate-900" value="Hindi">Hindi</option>
                  <option className="text-slate-900" value="Kannada">Kannada</option>
                  <option className="text-slate-900" value="Tamil">Tamil</option>
                </select>
                <button onClick={clearChat} className="rounded-2xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20" title="Clear chat">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="flex gap-2 overflow-x-auto border-b border-white/40 bg-white/45 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            {QUICK_PROMPTS.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.query)}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <Icon className="h-3.5 w-3.5" />{prompt.label}
                </button>
              );
            })}
          </div>

          {/* Chat area */}
          <div className="max-h-[560px] min-h-[430px] space-y-4 overflow-y-auto bg-slate-50/65 p-5 dark:bg-slate-950/20">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={`${msg.role}-${i}`} message={msg} onSuggestion={sendMessage} />
              ))}
              {loading && <TypingIndicator />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-white/40 bg-white/65 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={usingMockData ? "Ask about roads, budgets, contractors, complaints… (demo mode)" : "Ask about any road, budget, contractor, complaint, or civic action"}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-mint-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-mint-500 dark:text-slate-950"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              {usingMockData ? "🟡 Demo mode — connect backend for live AI" : "🟢 Connected — live road intelligence active"}
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

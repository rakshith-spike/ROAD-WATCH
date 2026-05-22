import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../providers/AuthProvider";

const DEFAULT_FORM = {
  full_name: "",
  email: "",
  password: "",
  role: "citizen",
};

export function AuthCard({ defaultMode = "login", onSuccess = null }) {
  const [mode, setMode] = useState(defaultMode);
  const [form, setForm] = useState(DEFAULT_FORM);
  const { login, signup, authLoading } = useAuth();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event, isDemo = false) {
    event.preventDefault();
    try {
      if (isDemo || mode === "login") {
        const credentials = isDemo ? { email: "demo@roadwatch.city", password: "demo123" } : { email: form.email, password: form.password };
        const user = await login(credentials);
        toast.success(isDemo ? "Demo mode — all features active" : "Logged in successfully");
        onSuccess?.(user, "login");
      } else {
        const user = await signup(form);
        toast.success("Account created");
        onSuccess?.(user, "signup");
      }
      setForm(DEFAULT_FORM);
    } catch (err) {
      if (!isDemo) toast.error(`Auth failed: ${err.message}`);
      else {
        // If demo fails (shouldn't), just set user directly
        toast.error("Demo login failed. Check AuthProvider.");
      }
    }
  }

  return (
    <form className="glass-panel" onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Secure Access</h3>
        <button type="button" onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))} className="text-xs font-semibold text-slate-500 dark:text-slate-300">
          {mode === "login" ? "Create account" : "Already registered"}
        </button>
      </div>

      <div className="space-y-2">
        {mode === "signup" ? (
          <input required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Full Name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
        ) : null}
        <input required type="email" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input required type="password" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} />
        {mode === "signup" ? (
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="citizen">citizen</option>
            <option value="contractor">contractor</option>
            <option value="government_admin">government_admin</option>
            <option value="super_admin">super_admin</option>
          </select>
        ) : null}
      </div>

      <button type="submit" disabled={authLoading} className="mt-3 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint-600 dark:text-slate-950">
        {authLoading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
      </button>
      {mode === "login" && (
        <button
          type="button"
          disabled={authLoading}
          onClick={() => handleSubmit({ preventDefault: () => {} }, true)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          ⚡ Demo Login (no backend needed)
        </button>
      )}
    </form>
  );
}

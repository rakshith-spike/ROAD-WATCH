import { useEffect, useState } from "react";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { api } from "../services/api";

export default function ContractorsPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    api.getContractorProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Contractor Accountability"
          title="Performance and Risk Monitoring"
          description="Track contractor quality, pending audits, and road-level accountability signals."
        />

        <section className="grid gap-3 lg:grid-cols-2">
          {profiles.map((profile) => (
            <article key={profile.name} className="glass-panel">
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{profile.name}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Risk: {profile.risk_level}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-slate-100 p-2 dark:bg-white/10">Rating: {profile.rating}</div>
                <div className="rounded-xl bg-slate-100 p-2 dark:bg-white/10">Projects: {profile.completed_projects}</div>
                <div className="rounded-xl bg-slate-100 p-2 dark:bg-white/10">Audits: {profile.pending_audits}</div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </PageTransition>
  );
}

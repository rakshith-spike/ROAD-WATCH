import { ContractorBarChart } from "../components/charts/ContractorBarChart";
import { CategoryPieChart } from "../components/charts/CategoryPieChart";
import { TrendChart } from "../components/charts/TrendChart";
import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";

export default function AnalyticsPage() {
  const { trends, contractors, complaints } = usePlatform();

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Advanced Analytics"
          title="Complaint Trends, Contractor Rankings, and Predictive Insights"
          description="Ward-wise ready analytics cards for government reviewers, judges, and decision makers."
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <TrendChart data={trends} />
          <ContractorBarChart data={contractors} />
          <CategoryPieChart complaints={complaints} />
          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">AI Summary</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Complaint pressure is concentrated around low-quality corridors with high utilization budgets. Immediate impact comes from contractor audit-first maintenance on critical roads and parallel citizen communication loops.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li>1. Prioritize roads below 40 quality score for emergency patching.</li>
              <li>2. Trigger spend-validation for utilization above 90%.</li>
              <li>3. Increase preventive maintenance for moderate risk clusters.</li>
            </ul>
          </article>
        </div>
      </div>
    </PageTransition>
  );
}

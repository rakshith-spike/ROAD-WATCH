import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ContractorBarChart({ data }) {
  return (
    <div className="glass-panel h-80">
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Contractor Accountability Ranking</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="contractor" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quality_score" fill="#29d8b0" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

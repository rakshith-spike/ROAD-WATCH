import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }) {
  return (
    <div className="glass-panel h-80">
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Monthly Complaint Trends</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f75546" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f75546" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="complaints" stroke="#f75546" fill="url(#complaintGradient)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

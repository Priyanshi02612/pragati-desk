import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../ui/Card";

export const PerformanceCharts = ({ performanceSeries }) => (
  <div className="grid gap-6 xl:grid-cols-2">
    <Card className="h-[360px]">
      <div className="mb-5">
        <h3 className="section-title">Task Completion Rate</h3>
        <p className="section-copy">
          Daily completion and delay trends across the team.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={performanceSeries.completion}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Bar
            dataKey="completionRate"
            fill="#16A34A"
            radius={[10, 10, 0, 0]}
          />
          <Bar dataKey="delayRate" fill="#F59E0B" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    <Card className="h-[360px]">
      <div className="mb-5">
        <h3 className="section-title">Weekly / Monthly Performance</h3>
        <p className="section-copy">Trendline view of performance momentum.</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={performanceSeries.monthly}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" domain={[70, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="performance"
            stroke="#1D4ED8"
            strokeWidth={3}
            dot={{ fill: "#1D4ED8", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  </div>
);

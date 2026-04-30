import { AlertTriangle, BarChart3, CircleCheckBig, Users2 } from "lucide-react";
import { Card } from "../ui/Card";

const items = [
  { key: "completion", label: "Completion Rate", icon: CircleCheckBig, tone: "text-brand-primary bg-emerald-50" },
  { key: "delay", label: "Delay Ratio", icon: AlertTriangle, tone: "text-brand-danger bg-rose-50" },
  { key: "productivity", label: "Team Productivity", icon: Users2, tone: "text-brand-secondary bg-blue-50" },
  { key: "weekly", label: "Weekly Progress", icon: BarChart3, tone: "text-amber-700 bg-amber-50" },
];

export const AnalyticsCards = ({ values }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => {
      const Icon = item.icon;

      return (
        <Card key={item.key}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-brand-muted">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-brand-text">
                {values[item.key]}
              </p>
            </div>
            <div className={`rounded-2xl p-3 ${item.tone}`}>
              <Icon size={20} />
            </div>
          </div>
        </Card>
      );
    })}
  </div>
);

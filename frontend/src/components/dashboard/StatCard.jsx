import { Card } from "../ui/Card";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  helper,
  tone = "primary",
}) => {
  const toneClasses = {
    primary: "bg-emerald-50 text-brand-primary",
    secondary: "bg-blue-50 text-brand-secondary",
    accent: "bg-amber-50 text-brand-accent",
    danger: "bg-rose-50 text-brand-danger",
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-100/70 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-muted">{label}</p>
          <h3 className="mt-3 text-3xl font-bold text-brand-text">{value}</h3>
          <p className="mt-2 text-sm text-brand-muted">{helper}</p>
        </div>
        <span className={`rounded-2xl p-3 ${toneClasses[tone]}`}>
          <Icon size={22} />
        </span>
      </div>
    </Card>
  );
};

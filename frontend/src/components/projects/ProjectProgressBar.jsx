export const ProjectProgressBar = ({ value, showLabel = true }) => (
  <div>
    {showLabel ? (
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-brand-muted">Progress</span>
        <span className="font-semibold text-brand-text">{value}%</span>
      </div>
    ) : null}
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          value >= 100
            ? "bg-brand-primary"
            : value >= 70
              ? "bg-brand-secondary"
              : value >= 35
                ? "bg-amber-500"
                : "bg-slate-400"
        }`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

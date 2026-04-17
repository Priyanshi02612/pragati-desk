export const ProgressBar = ({ value, className = "" }) => (
  <div className={`h-2.5 rounded-full bg-slate-100 ${className}`}>
    <div
      className={`h-2.5 rounded-full ${
        value < 85 ? "bg-brand-danger" : "bg-brand-primary"
      } transition-all duration-500`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

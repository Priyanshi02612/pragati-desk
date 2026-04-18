export const Button = ({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) => {
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-emerald-700",
    secondary: "bg-brand-secondary text-white hover:bg-blue-800",
    muted: "bg-slate-100 text-brand-text hover:bg-slate-200",
    ghost: "bg-white/70 text-brand-text hover:bg-white",
    danger: "bg-brand-danger text-white hover:bg-red-700",
    accent: "bg-brand-accent text-white hover:bg-amber-600",
    warning: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:ring-2 focus-visible:ring-brand-secondary/30 ${variants[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

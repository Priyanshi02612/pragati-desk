export const InputField = ({
  label,
  error,
  as = "input",
  options = [],
  className = "",
  ...props
}) => {
  const baseClassName = `w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text shadow-sm transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 ${className}`;

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-text">
      {label}
      {as === "select" ? (
        <select className={baseClassName} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea className={baseClassName} {...props} />
      ) : (
        <input className={baseClassName} {...props} />
      )}
      {error ? (
        <span className="text-xs text-brand-danger">{error}</span>
      ) : null}
    </label>
  );
};

const getInitials = (name) => {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return "?";
  }

  return parts.map((part) => part[0].toUpperCase()).join("");
};

export const Avatar = ({ src, name, size = "md" }) => {
  const sizeClassName = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }[size] || "h-10 w-10 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        className={`${sizeClassName} rounded-full border border-brand-border/70 object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClassName} flex items-center justify-center rounded-full bg-brand-secondary font-semibold text-white shadow-sm`}
      aria-label={name || "User avatar"}
      title={name || "User avatar"}
    >
      {getInitials(name)}
    </div>
  );
};

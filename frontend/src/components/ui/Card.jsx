export const Card = ({ children, className = "" }) => (
  <div className={`panel p-5 ${className}`}>{children}</div>
);

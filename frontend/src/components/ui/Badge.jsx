import { getStatusTone } from '../../utils/format';

export const Badge = ({ children, tone, className = '' }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      tone || getStatusTone(children)
    } ${className}`}
  >
    {children}
  </span>
);

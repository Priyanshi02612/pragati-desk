export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);

export const formatPercent = (value) => `${value.toFixed(0)}%`;

export const secondsToClock = (value) => {
  const hrs = String(Math.floor(value / 3600)).padStart(2, '0');
  const mins = String(Math.floor((value % 3600) / 60)).padStart(2, '0');
  const secs = String(value % 60).padStart(2, '0');

  return `${hrs}:${mins}:${secs}`;
};

export const getStatusTone = (status) => {
  const tones = {
    Pending: 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-amber-100 text-amber-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Delayed: 'bg-rose-100 text-rose-700',
  };

  return tones[status] || 'bg-slate-100 text-slate-600';
};

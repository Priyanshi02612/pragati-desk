import { secondsToClock } from "../../utils/format";

export const TimerDisplay = ({ seconds }) => (
  <div className="rounded-2xl bg-slate-950 px-4 py-2 text-center font-mono text-lg font-semibold tracking-widest text-white">
    {secondsToClock(seconds)}
  </div>
);

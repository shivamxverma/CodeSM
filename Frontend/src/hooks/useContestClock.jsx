import { useEffect, useState } from "react";
import { getClock } from "../api/api.js"; 

export default function useContestClock(contestId) {
  const [now, setNow] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    let t;
    async function boot() {
      const { data } = await getClock(contestId);
      setNow(new Date(data.now));
      setStart(new Date(data.startTime));
      setEnd(new Date(data.endTime));
    }
    boot();
    t = setInterval(() => setNow((n) => n ? new Date(n.getTime() + 1000) : null), 1000);
    return () => clearInterval(t);
  }, [contestId]);

  const msTo = (d) => (d && now ? Math.max(0, d - now) : null);
  const phase = !now || !start || !end ? "loading" :
    now < start ? "before" :
    now >= start && now < end ? "running" : "ended";

  return { phase, now, start, end, toStartMs: msTo(start), toEndMs: msTo(end) };
}

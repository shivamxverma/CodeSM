export function getDifficultyFromRating(rating) {
    if (!rating)
      return {
        label: "Unknown",
        style: "bg-[#1d2736] text-gray-300 border-[#2a3750]",
      };
    
    const r = String(rating).toUpperCase();
    if (r === "EASY" || (Number(r) >= 800 && Number(r) <= 1200))
      return {
        label: "Easy",
        style: "bg-[#0e2a1d] text-green-300 border-[#1e5d3b]",
      };
    if (r === "MEDIUM" || (Number(r) >= 1300 && Number(r) <= 1700))
      return {
        label: "Medium",
        style: "bg-[#3a2a0e] text-yellow-300 border-[#6a531e]",
      };
    if (r === "HARD" || Number(r) >= 1800)
      return {
        label: "Hard",
        style: "bg-[#2a1313] text-red-300 border-[#5d1e1e]",
      };
      
    return {
      label: "Hard",
      style: "bg-[#2a1313] text-red-300 border-[#5d1e1e]",
    };
}

export function getYouTubeEmbed(url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
        if (u.pathname.startsWith("/shorts/")) {
          const shortId = u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0];
          if (shortId) return `https://www.youtube.com/embed/${shortId}`;
        }
      }
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch { }
    return null;
}

export function normalizeStoredJobResult(doc) {
  let execution = [];
  try {
    const parsed = JSON.parse(doc.output || "[]");
    execution = Array.isArray(parsed) ? parsed : [];
  } catch {
    execution = [];
  }
  const hasTLE = execution.some(
    (t) => t?.isTLE || /exited/i.test(String(t?.output || t?.error || t?.actual || ""))
  );
  const allPassed = execution.length > 0 && execution.every((t) => !!t?.isPassed);
  let status = "rejected";
  if (doc.status === "failed") status = "failed";
  else if (hasTLE) status = "tle";
  else if (allPassed) status = "accepted";
  return { status, execution };
}
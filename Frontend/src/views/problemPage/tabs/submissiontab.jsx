export function SubmissionTab({ submissions, refetchSubmissions }) {
  return (
    <div className="h-full overflow-y-auto">
      <button
        type="button"
        className="mb-3 px-3 py-1 rounded bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-xs"
        onClick={() => refetchSubmissions?.()}
      >
        Refresh Submissions
      </button>
      {submissions.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          No submissions found.
        </div>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#121923]">
              <th className="border border-[#233046] px-2 py-1">#</th>
              <th className="border border-[#233046] px-2 py-1">Username</th>
              <th className="border border-[#233046] px-2 py-1">Status</th>
              <th className="border border-[#233046] px-2 py-1">Language</th>
              <th className="border border-[#233046] px-2 py-1">Time</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => (
              <tr key={sub._id || idx} className="bg-[#0c1219]">
                <td className="border border-[#233046] px-2 py-1">{idx + 1}</td>
                <td className="border border-[#233046] px-2 py-1">
                  {sub.user.username || "N/A"}
                </td>
                <td className="border border-[#233046] px-2 py-1">{sub.status || "N/A"}</td>
                <td className="border border-[#233046] px-2 py-1">{sub.language || "N/A"}</td>
                <td className="border border-[#233046] px-2 py-1">
                  {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

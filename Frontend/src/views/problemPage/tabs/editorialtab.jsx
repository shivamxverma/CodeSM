import ReactMarkdown from "react-markdown";

export function EditorialTab({ embedUrl, problem }) {
  return (
    <div className="space-y-4">
      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#233046] bg-black shadow">
          <iframe
            title="Editorial Video"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
      {problem?.editorialLink && !embedUrl && (
        <a
          href={problem.editorialLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-300 hover:underline"
        >
          Open editorial link
        </a>
      )}
      {problem?.editorial ? (
        <div className="prose prose-invert max-w-none prose-pre:bg-[#0c1219] prose-code:text-gray-200">
          <ReactMarkdown>{problem.editorial}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-sm text-gray-400">No editorial provided.</div>
      )}
    </div>
  );
}

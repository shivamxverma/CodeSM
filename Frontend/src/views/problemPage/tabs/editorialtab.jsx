import React from "react";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { getProblemEditorial } from "@/api/api";
import { Loader2 } from "lucide-react";
import { getYouTubeEmbed } from "@/components/problempage/helper";

export function EditorialTab({ problem }) {
  const problemId = problem?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["problem-editorial", problemId],
    queryFn: () => getProblemEditorial(problemId).then((r) => r.data.data),
    enabled: !!problemId,
  });

  const editorialData = React.useMemo(() => {
    if (!data) return null;
    let content = data.editorialContent;
    
    // safe parsing for double-encoded strings
    if (typeof content === 'string') {
      try {
        if (content.trim().startsWith('"') && content.trim().endsWith('"')) {
          content = JSON.parse(content.trim());
        } else if (content.includes('\\n') && !content.includes('\n')) {
          content = JSON.parse(`"${content.replace(/"/g, '\\"')}"`);
        }
      } catch (e) {
        console.error("Error parsing editorial content:", e);
      }
    }
    
    return {
      ...data,
      editorialContent: content,
      embedUrl: getYouTubeEmbed(data.editorialLink)
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">Fetching official editorial...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 text-sm text-red-400">
        {error?.response?.data?.message || "Failed to load editorial."}
      </div>
    );
  }

  if (!editorialData) {
    return <div className="text-sm text-gray-400 py-6 text-center italic">No official editorial available.</div>;
  }

  const { editorialContent, editorialLink, embedUrl } = editorialData;

  return (
    <div className="space-y-6 pb-12">
      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#233046] bg-black shadow-2xl">
          <iframe
            title="Editorial Video"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
      
      {editorialLink && (
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Reference Link:</span>
           <a
            href={editorialLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition-colors underline decoration-blue-300/30 underline-offset-4"
          >
            Open External Editorial
          </a>
        </div>
      )}

      {editorialContent ? (
        <div className="prose prose-invert max-w-none prose-pre:bg-[#0c1219] prose-pre:border prose-pre:border-[#233046] prose-code:text-blue-200 prose-headings:text-blue-300">
          <ReactMarkdown>{editorialContent}</ReactMarkdown>
        </div>
      ) : !embedUrl && !editorialLink ? (
        <div className="text-sm text-gray-400 text-center py-12 border border-dashed border-[#233046] rounded-xl">
           No written editorial content available for this problem.
        </div>
      ) : null}
    </div>
  );
}

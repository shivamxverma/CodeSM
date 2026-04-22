import React, { useMemo } from "react";
import { Field, CharCount } from "./Field";

const isValidUrl = (s) => {
  if (!s) return true;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

export default function Editorial({ formData, updateField }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Editorial (optional)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Editorial (Markdown supported)"
          hint={<CharCount value={formData.editorial} max={20000} />}
        >
          <textarea
            value={formData.editorial}
            onChange={(e) => updateField("editorial", e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 font-mono text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
            placeholder={
              "# Approach\nExplain your intuition, algorithm, and complexity.\n\n## Steps\n1. ..."
            }
          />
        </Field>
        <Field label="Editorial Link (URL)">
          <input
            type="url"
            value={formData.editorialLink}
            onChange={(e) => updateField("editorialLink", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="https://your-blog-or-notion-page.com/post"
          />
          {formData.editorialLink && !isValidUrl(formData.editorialLink) && (
            <p className="mt-1 text-xs text-rose-300">Invalid URL</p>
          )}
        </Field>
      </div>
    </section>
  );
}

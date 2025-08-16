import React, { useState } from "react";
import { createContest } from "../api/api.js";
import { useNavigate } from "react-router-dom";

export default function ContestCreatePage() {
  const nav = useNavigate();
  const [f, setF] = useState({
    title: "",
    description: "",
    visibility: "public",
    startTime: "",
    durationMinutes: 120,
    problems: [{ problemId: "", index: "A", points: 100 }],
  });
  const [err, setErr] = useState("");

  const addProblem = () => setF((s) => ({ ...s, problems: [...s.problems, { problemId: "", index: "", points: 100 }] }));
  const rmProblem = (i) => setF((s) => ({ ...s, problems: s.problems.filter((_, j) => j !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...f,
        problems: f.problems.map(p => ({ problem: p.problemId, index: p.index || "", points: Number(p.points||0) }))
      };
      await createContest(payload);
      nav("/contests");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create contest");
    }
  };

  const Field = ({label, children}) => (
    <label className="block">
      <div className="text-sm mb-1 text-slate-300">{label}</div>
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Create Contest</h1>
        {err && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <input value={f.title} onChange={e=>setF({...f, title:e.target.value})}
              className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2" />
          </Field>
          <Field label="Description">
            <textarea value={f.description} onChange={e=>setF({...f, description:e.target.value})}
              rows={4} className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Visibility">
              <select value={f.visibility} onChange={e=>setF({...f, visibility:e.target.value})}
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </Field>
            <Field label="Start Time">
              <input type="datetime-local" value={f.startTime} onChange={e=>setF({...f, startTime:e.target.value})}
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2"/>
            </Field>
            <Field label="Duration (minutes)">
              <input type="number" value={f.durationMinutes} onChange={e=>setF({...f, durationMinutes:e.target.value})}
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2"/>
            </Field>
          </div>

          <div className="rounded-xl border border-white/10 p-3 space-y-3">
            <div className="text-sm font-semibold">Problems</div>
            {f.problems.map((p,i)=>(
              <div key={i} className="grid sm:grid-cols-4 gap-2">
                <input placeholder="Problem ID (Mongo _id)" value={p.problemId}
                  onChange={e=>setF(s=>{const a=[...s.problems]; a[i].problemId=e.target.value; return {...s, problems:a};})}
                  className="rounded bg-slate-900 border border-white/10 px-3 py-2"/>
                <input placeholder="Index (A/B/C...)" value={p.index}
                  onChange={e=>setF(s=>{const a=[...s.problems]; a[i].index=e.target.value; return {...s, problems:a};})}
                  className="rounded bg-slate-900 border border-white/10 px-3 py-2"/>
                <input type="number" placeholder="Points" value={p.points}
                  onChange={e=>setF(s=>{const a=[...s.problems]; a[i].points=e.target.value; return {...s, problems:a};})}
                  className="rounded bg-slate-900 border border-white/10 px-3 py-2"/>
                <button type="button" onClick={()=>rmProblem(i)}
                  className="rounded bg-rose-600/80 hover:bg-rose-600 px-3 py-2 text-sm">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addProblem}
              className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm">+ Add Problem</button>
          </div>

          <div className="flex justify-end">
            <button className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold">
              Create Contest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

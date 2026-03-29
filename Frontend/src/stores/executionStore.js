import { create } from "zustand";

/**
 * In-memory execution results per problem.
 * run: last "Run" (dry-run) payload from the job queue response.
 * submit: last "Submit" payload — either from DB job result or inline queue result.
 */
export const useExecutionStore = create((set) => ({
  runByProblemId: {},
  submitByProblemId: {},

  setRunResult: (problemId, payload) =>
    set((s) => ({
      runByProblemId: { ...s.runByProblemId, [problemId]: payload },
    })),

  setSubmitResult: (problemId, payload) =>
    set((s) => ({
      submitByProblemId: { ...s.submitByProblemId, [problemId]: payload },
    })),

  clearRunResult: (problemId) =>
    set((s) => {
      const next = { ...s.runByProblemId };
      delete next[problemId];
      return { runByProblemId: next };
    }),

  clearSubmitResult: (problemId) =>
    set((s) => {
      const next = { ...s.submitByProblemId };
      delete next[problemId];
      return { submitByProblemId: next };
    }),
}));

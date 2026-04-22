import React from "react";
import { DescriptionTab } from "@/views/problemPage/tabs/descriptiontab";
import { EditorialTab } from "@/views/problemPage/tabs/editorialtab";
import { SubmissionTab } from "@/views/problemPage/tabs/submissiontab";
import { SolutionTab } from "@/views/problemPage/tabs/soutiontab";
import { HintTab } from "@/views/problemPage/tabs/HintTab";
import ProblemDiscussions from "@/views/discussion/ProblemDiscussions";

export default function ProblemTabContent({
  activeTab,
  problem,
  problemId,
  submissions,
  refetchSubmissions,
  hints,
  hintsLoading,
  hintsError,
  revealedHintIndex,
  setRevealedHintIndex,
}) {
  if (activeTab === "Description") {
    return <DescriptionTab problem={problem} />;
  }

  if (activeTab === "Editorial") {
    return <EditorialTab problem={problem} />;
  }

  if (activeTab === "Submissions") {
    return (
      <SubmissionTab
        submissions={submissions}
        refetchSubmissions={refetchSubmissions}
      />
    );
  }

  if (activeTab === "Solutions") {
    return <SolutionTab problem={problem} />;
  }

  if (activeTab === "Hints") {
    return (
      <HintTab
        hints={hints}
        hintsLoading={hintsLoading}
        hintsError={hintsError}
        revealedHintIndex={revealedHintIndex}
        setRevealedHintIndex={setRevealedHintIndex}
        problemId={problemId}
      />
    );
  }

  if (activeTab === "Discussions") {
    return <ProblemDiscussions problemId={problemId || problem?.id || problem?._id} />;
  }

  return null;
}

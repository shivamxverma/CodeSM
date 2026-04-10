export const TABS = [
  "Description",
  "Editorial",
  "Submissions",
  "Solutions",
  "Hints",
  "Discussions",
];

export function getDifficultyFromRating(rating) {
  if (!rating)
    return {
      label: "Unknown",
      style: "bg-[#1d2736] text-gray-300 border-[#2a3750]",
    };
  if (rating >= 800 && rating <= 1200)
    return {
      label: "Easy",
      style: "bg-[#0e2a1d] text-green-300 border-[#1e5d3b]",
    };
  if (rating >= 1300 && rating <= 1700)
    return {
      label: "Medium",
      style: "bg-[#3a2a0e] text-yellow-300 border-[#6a531e]",
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
  } catch {
    // ignore invalid URL
  }
  return null;
}

/** Map persisted JobResult document to the same shape as queue execution payloads. */
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

export function monacoLanguageFrom(language) {
  return language === "golang" ? "go" : language;
}

export function starterCodeByLanguage() {
  return {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  return 0;
}`,
    c: `#include <stdio.h>

int main(void) {
  return 0;
}`,
    java: `import java.io.*;
import java.util.*;

public class Main {
  public static void main(String[] args) throws Exception {
  }
}`,
    python: `def main():
  pass

if __name__ == "__main__":
  main()
`,
    javascript: `function main() {
}

main();
`,
    go: `package main

import "fmt"

func main() {
  _ = fmt.Sprintf("")
}
`,
  };
}


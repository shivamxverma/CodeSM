import {
  SANDBOX_MEMORY,
  SANDBOX_CPUS,
  SANDBOX_PIDS_LIMIT,
  COMPILE_TIMEOUT_SEC,
  RUN_TIMEOUT_SEC,
} from "../../utils/constants.js";

function dockerUserArgs() {
  if (process.platform === "win32") return [];
  const uid =
    typeof process.getuid === "function" ? process.getuid() : undefined;
  const gid =
    typeof process.getgid === "function" ? process.getgid() : undefined;
  if (typeof uid === "number" && typeof gid === "number") {
    return ["--user", `${uid}:${gid}`];
  }
  return [];
}

export function dockerResourceAndSecurityArgs() {
  return [
    "--memory",
    SANDBOX_MEMORY,
    "--memory-swap",
    SANDBOX_MEMORY,
    "--cpus",
    SANDBOX_CPUS,
    "--pids-limit",
    SANDBOX_PIDS_LIMIT,
    "--network",
    "none",
    "--security-opt",
    "no-new-privileges:true",
    "--cap-drop",
    "ALL",
    "--stop-timeout",
    "5",
    ...dockerUserArgs(),
  ];
}

export function normalizeLanguage(language) {
  const raw = String(language || "")
    .toLowerCase()
    .trim();
  if (raw === "golang") return "go";
  if (raw === "js") return "javascript";
  if (raw === "py") return "python";
  if (raw === "c++") return "cpp";
  return raw;
}

export function languageSpec(language) {
  const lang = normalizeLanguage(language);
  const specs = {
    cpp: {
      id: "cpp",
      filename: "main.cpp",
      kind: "compiled",
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s g++ main.cpp -O2 -std=c++17 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: "binary", path: "user_program" },
    },
    c: {
      id: "c",
      filename: "main.c",
      kind: "compiled",
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s gcc main.c -O2 -std=c11 -fdiagnostics-color=never -o user_program 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: "binary", path: "user_program" },
    },
    java: {
      id: "java",
      filename: "Main.java",
      kind: "compiled",
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s javac -J-Dfile.encoding=UTF-8 -encoding UTF-8 Main.java 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s java -Dfile.encoding=UTF-8 -cp /tmp Main`,
      artifacts: { type: "class", className: "Main" },
    },
    go: {
      id: "go",
      filename: "main.go",
      kind: "compiled",
      compile: `timeout ${COMPILE_TIMEOUT_SEC}s bash -lc 'GOMODCACHE=/tmp/gomodcache GOPATH=/tmp/gopath GOCACHE=/tmp/gocache go build -o user_program main.go' 2> /tmp/compile.err`,
      run: `timeout ${RUN_TIMEOUT_SEC}s ./user_program`,
      artifacts: { type: "binary", path: "user_program" },
    },
    python: {
      id: "python",
      filename: "main.py",
      kind: "interpreted",
      run: `timeout ${RUN_TIMEOUT_SEC}s python3 -B main.py`,
    },
    javascript: {
      id: "javascript",
      filename: "main.js",
      kind: "interpreted",
      run: `timeout ${RUN_TIMEOUT_SEC}s node main.js`,
    },
  };
  return specs[lang] || null;
}

export const normalizeOut = (s) =>
  (s ?? "").toString().replace(/\r\n/g, "\n").trim();

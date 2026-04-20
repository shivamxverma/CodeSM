import axios from "axios";
const BASE = import.meta.env.VITE_API_URL;

export const login = (payload) => {
  return axios.post(`${BASE}/users/login`, payload, {
    withCredentials: true,
  });
}

export const signup = (payload) => {
  return axios.post(`${BASE}/auth/register`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
}

export const verifyEmail = (token) => {
  return axios.get(`${BASE}/auth/?token=${token}`);
}

export const logout = () => {
  return axios.post(`${BASE}/users/logout`, {}, {
    withCredentials: true,
  });
}

export const getAllProblems = () => {
  return axios.get(`${BASE}/problem`, { withCredentials: true });
}

export const getProblem = (id) => {
  return axios.get(`${BASE}/problem/${id}`, { withCredentials: true });
}

export const createProblem = (payload) => {
  return axios.post(`${BASE}/problem/createproblem`, payload, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createSubmission = async (problemId, payload, idempotencyKey) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return await axios.post(`${BASE}/submission/${problemId}/submit`, payload, {
    withCredentials: true,
    headers,
  });
};

export const runCode = async (problemId, payload) => {
  return await axios.post(`${BASE}/submission/${problemId}/run`, payload, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/** Persisted job result after a full submission (MongoDB jobResult). */
export const getSubmitJobResult = (jobId, submissionId) => {
  return axios.get(`${BASE}/job/${jobId}/get-result/${submissionId}`, {
    withCredentials: true,
  });
};

export const getRunJobResult = (jobId) => {
  return axios.get(`${BASE}/job/${jobId}/get-run-result`, {
    withCredentials: true,
  });
};

export const getSubmissions = (problemId) => {
  return axios.get(`${BASE}/submission/${problemId}`, {
    withCredentials: true,
  });
};

export const getProblemHints = (problemId) => {
  return axios.get(`${BASE}/problem/upsolve/${problemId}`, { withCredentials: true });
}

export const listContests = () =>
  axios.get(`${BASE}/contest`, { withCredentials: true });

export const createContest = (payload) =>
  axios.post(`${BASE}/contest`, payload, {
    withCredentials: true,
  });

export const getContest = (id) =>
  axios.get(`${BASE}/contest/${id}`, { withCredentials: true });

export const registerContest = (id) =>
  axios.post(`${BASE}/contest/${id}/register`, {}, {
    withCredentials: true,
  });

export const getClock = (id) =>
  axios.get(`${BASE}/contest/${id}/clock`, { withCredentials: true });

export const getLeaderboard = (id) =>
  axios.get(`${BASE}/contest/${id}/leaderboard`, {
    withCredentials: true,
  });

export const getQuestionsForInterview = (payload) => {
  return axios.post(`${BASE}/interview`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const getScoreForQuestion = (currentQuestionIndex, questions, userAnswer, meta = {}) => {
  const { round, codingLanguage } = meta;
  return axios.post(
    `${BASE}/interview/score`,
    {
      question: questions[currentQuestionIndex].text,
      answer: userAnswer,
      ...(round ? { round } : {}),
      ...(codingLanguage ? { codingLanguage } : {}),
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export const getAllDiscussion = (problemId) => {
  return axios.get(`${BASE}/discussion${problemId ? `?problemId=${problemId}` : ''}`, {
    withCredentials: true,
  });
};

export const createDiscussion = (payload) => {
  return axios.post(`${BASE}/discussion`, payload, {
    withCredentials: true,
  });
};

export const likeDiscussion = (discussionId) => {
  return axios.get(`${BASE}/discussion/${discussionId}/like`, {
    withCredentials: true,
  });
};

export const dislikeDiscussion = (discussionId) => {
  return axios.get(`${BASE}/discussion/${discussionId}/dislike`, {
    withCredentials: true,
  });
};

export const createComment = (discussionId, comment) => {
  return axios.post(`${BASE}/discussion/${discussionId}/comment`, comment, {
    withCredentials: true,
  });
};

export const getAllRequest = () => {
  return axios.get(`${BASE}/admin`, {
    withCredentials: true,
  });
};

export const forgotPassword = (email) =>
  axios.post(`${BASE}/users/forgot-password`, { email });

export const resetPassword = (token, password, confirmPassword) =>
  axios.post(`${BASE}/users/reset-password/${token}`, { password, confirmPassword });

export const getCurrentUser = () => {
  return axios.get(`${BASE}/auth/me`, {
    withCredentials: true,
  });
}


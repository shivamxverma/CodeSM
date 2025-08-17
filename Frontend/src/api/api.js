import axios from "axios";
const BASE = "http://localhost:8000/api/v1";
const accessToken = localStorage.getItem("accessToken");

export const login = (payload) => {
  return axios.post(`${BASE}/users/login`, payload, {
    withCredentials: true,
  });
}

export const signup = (payload) => {
  return axios.post(`${BASE}/users/register`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
}

export const logout = () => {
  return axios.post(`${BASE}/users/logout`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export const getAllProblems = () => {
  return axios.get(`${BASE}/problem`, { withCredentials: true });
}

export const getProblem = (id) => {
  return axios.get(`${BASE}/problem/${id}`, { withCredentials: true });
}

export const createProblem = (payload) => {
  return axios.post(
    "http://localhost:8000/api/v1/problem/createproblem",
    payload,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export const runProblem = (problemId, payload, asSubmit = false) => {
  return axios.post(
    `${BASE}/submission/${problemId}${asSubmit ? "" : "?dryRun=true"}`,
    payload,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export const getSubmissions = (problemId) => {
  return axios.get(`${BASE}/submission/${problemId}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export const getProblemHints = (problemId) => {
  return axios.get(`${BASE}/problem/upsolve/${problemId}`,);
}

export const listContests = () =>
  axios.get(`${BASE}/contest`, { withCredentials: true });

export const createContest = (payload) =>
  axios.post(`${BASE}/contest`, payload, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });

export const getContest = (id) =>
  axios.get(`${BASE}/contest/${id}`, { withCredentials: true });

export const registerContest = (id) =>
  axios.post(`${BASE}/contest/${id}/register`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });

export const getClock = (id) =>
  axios.get(`${BASE}/contest/${id}/clock`, { withCredentials: true });

export const getLeaderboard = (id) =>
  axios.get(`${BASE}/contest/${id}/leaderboard`, { withCredentials: true });

export const getQuestionsForInterview = (selectedRoleName, selectedExperienceName) => {
  return axios.post(`http://localhost:8000/api/v1/interview`, {
    role: selectedRoleName,
    experience: selectedExperienceName
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const getScoreForQuestion = (currentQuestionIndex,questions,userAnswer) => {
  return axios.post(
    `http://localhost:8000/api/v1/interview/score`,
    {
      question: questions[currentQuestionIndex].text,
      answer: userAnswer
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
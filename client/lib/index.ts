import axios from "axios";
const BASE = "http://localhost:8000/api/v1";
// const BASE = "https://codesm.onrender.com/api/v1";
const accessToken = localStorage.getItem("accessToken");

export const login = (payload : any) => {
  return axios.post(`${BASE}/users/login`, payload, {
    withCredentials: true,
  });
}

export const signup = (payload : any) => {
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

export const getProblem = (id : any) => {
  return axios.get(`${BASE}/problem/${id}`, { withCredentials: true });
}

export const createProblem = (payload : any) => {
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

export const runProblem = async (problemId : any, payload : any, asSubmit = false) => {
  console.log("Running problem with ID:", problemId);
  return await axios.post(
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

export const getJobResponse = (jobId : any) => {
  return axios.get(`${BASE}/job/${jobId}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export const getSubmissions = (problemId : any) => {
  return axios.get(`${BASE}/submission/${problemId}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export const getProblemHints = (problemId : any) => {
  return axios.get(`${BASE}/problem/upsolve/${problemId}`, { withCredentials: true });
}

export const listContests = () =>
  axios.get(`${BASE}/contest`, { withCredentials: true });

export const createContest = (payload : any) =>
  axios.post(`${BASE}/contest`, payload, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });

export const getContest = (id : any) =>
  axios.get(`${BASE}/contest/${id}`, { withCredentials: true });

export const registerContest = (id : any) =>
  axios.post(`${BASE}/contest/${id}/register`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  });

export const getClock = (id : any) =>
  axios.get(`${BASE}/contest/${id}/clock`, { withCredentials: true });

export const getLeaderboard = (id : any) =>
  axios.get(`${BASE}/contest/${id}/leaderboard`, { withCredentials: true });

export const getQuestionsForInterview = (selectedRoleName : any, selectedExperienceName : any) => {
  return axios.post(`${BASE}/interview`, {
    role: selectedRoleName,
    experience: selectedExperienceName
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const getScoreForQuestion = (currentQuestionIndex : any, questions : any, userAnswer : any) => {
  return axios.post(
    `${BASE}/interview/score`,
    {
      question: questions[currentQuestionIndex].text,
      answer: userAnswer
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export const getAllDiscussion = () => {
  return axios.get(`${BASE}/discussion`, {
    withCredentials: true
  });
}

export const createDiscussion = (payload : any) => {
  return axios.post(`${BASE}/discussion`,
    payload,
    {
      withCredentials: true,
      headers: { Authorization: `Bearer ${accessToken}` }
    })
}

export const likeDiscussion = (discussionId : any) => {
  return axios.get(`${BASE}/${discussionId}/like`, { withCredentials: true });
}

export const dislikeDiscussion = (discussionId : any) => {
  return axios.get(`${BASE}/${discussionId}/dislike`, { withCredentials: true });
}

export const createComment = (discussionId : any, comment : any) => {
  return axios.post(`${BASE}/${discussionId}/comment`, comment, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

export const getAllRequest = () => {
  return axios.get(`${BASE}/admin`, {
    withCredentials : true,
    headers : {Authorization : `Bearer ${accessToken}`}
  })
}
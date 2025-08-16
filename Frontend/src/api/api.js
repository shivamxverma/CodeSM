import axios from "axios";
const BASE = "http://localhost:8000/api/v1";

export const listContests = () =>
  axios.get(`${BASE}/contest`, { withCredentials: true });

export const createContest = (payload) =>
  axios.post(`${BASE}/contest`, payload, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
  });

export const getContest = (id) =>
  axios.get(`${BASE}/contest/${id}`, { withCredentials: true });

export const registerContest = (id) =>
  axios.post(`${BASE}/contest/${id}/register`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
  });

export const getClock = (id) =>
  axios.get(`${BASE}/contest/${id}/clock`, { withCredentials: true });

export const getLeaderboard = (id) =>
  axios.get(`${BASE}/contest/${id}/leaderboard`, { withCredentials: true });

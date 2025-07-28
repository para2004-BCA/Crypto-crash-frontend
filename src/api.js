import axios from "axios";
import BACKEND_URL from "./config";

// Register new user
export const registerUser = async (username) => {
  const res = await axios.post(`${BACKEND_URL}/api/player/register`, { username });
  return res.data;
};

// Login existing user ✅
export const loginUser = async (username) => {
  const res = await axios.post(`${BACKEND_URL}/api/player/login`, { username });
  return res.data;
};

// Place a bet
export const placeBet = async (data) => {
  const res = await axios.post(`${BACKEND_URL}/api/game/bet`, data);
  return res.data;
};

export const withdrawAmount = async (data) => {
  const res = await axios.post(`${BACKEND_URL}/api/player/withdraw`, data);
  return res.data;
};
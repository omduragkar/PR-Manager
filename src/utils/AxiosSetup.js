import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";

export const contentAxios = axios.create({
  baseURL: "https://doubtful-deer-shoe.cyclic.app",
});
export const generateAxiosError = (message, config) => {
  const networkError = new Error(message);
  networkError.config = config;
  networkError.isAxiosError = true;
  return Promise.reject(networkError);
};

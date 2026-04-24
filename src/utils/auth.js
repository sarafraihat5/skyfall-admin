import Cookies from "js-cookie";

const TOKEN_KEY = "sf_token";

export const setAuth = (token) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: window.location.protocol === "https:",
    sameSite: "Strict", 
  });
};

export const getToken = () => Cookies.get(TOKEN_KEY);

export const clearAuth = () => Cookies.remove(TOKEN_KEY);

export const isAuthenticated = () => !!Cookies.get(TOKEN_KEY);
export const useSession = () => {
  const setToken = (token) => {
    localStorage.setItem("access_token", token);
  };
  const isAuthenticated = !!localStorage.getItem("access_token");
  const logOut = () => {
    localStorage.removeItem("access_token");
  };

  return { isAuthenticated, setToken, logOut };
};

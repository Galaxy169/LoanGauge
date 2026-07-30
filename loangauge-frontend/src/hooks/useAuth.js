import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useLogoutMutation } from "../services/authService";
import { setCredentials, logout as logoutAction } from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (credentials) => {
    const result = await loginMutation(credentials).unwrap();
    dispatch(setCredentials(result));
    navigate("/dashboard");
  };

  const logout = async () => {
    await logoutMutation();
    dispatch(logoutAction());
    navigate("/login");
  };

  return { user, isAuthenticated, login, logout, isLoggingIn };
}

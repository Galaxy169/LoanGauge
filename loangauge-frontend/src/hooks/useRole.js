import { useSelector } from "react-redux";

export function useRole() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  return {
    role,
    isUser: role === "USER",
    isPremium: role === "PREMIUM_USER",
    isAdvisor: role === "FINANCIAL_ADVISOR",
    isAdmin: role === "ADMINISTRATOR",
  };
}

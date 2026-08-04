import { useSelector } from "react-redux";

export const useRole = () => {
  const user = useSelector((state) => state.auth.user);

  const role = user?.role ?? null;

  const hasRole = (requiredRole) => role === requiredRole;
  const hasAnyRole = (requiredRoles = []) => requiredRoles.includes(role);

  return {
    role,
    isUser: role === "USER",
    isPremium: role === "PREMIUM_USER",
    isAdvisor: role === "FINANCIAL_ADVISOR",
    isAdmin: role === "ADMINISTRATOR",
    hasRole,
    hasAnyRole,
  };
};

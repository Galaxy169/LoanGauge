import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../store/authSlice';

export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    role: user?.role || null,
    isPremium: user?.role === 'PREMIUM_USER' || user?.role === 'ADMINISTRATOR',
    isAdmin: user?.role === 'ADMINISTRATOR',
    isAdvisor: user?.role === 'FINANCIAL_ADVISOR',
    isUser: user?.role === 'USER',
  };
}

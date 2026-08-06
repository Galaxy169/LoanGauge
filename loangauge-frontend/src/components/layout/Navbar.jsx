import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Gauge, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/store/authSlice';
import { useLogoutMutation } from '@/services/authApi';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      dispatch(logout());
      navigate('/');
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/upgrade' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Gauge size={18} />
          </span>
          <span className="font-heading text-[16px] font-bold text-text-primary">LoanGauge</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary-700' : 'text-text-secondary hover:text-text-primary'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard ({user?.firstName || 'User'})
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={LogOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="rounded-md p-2 text-text-secondary hover:bg-surface-hover md:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-text-secondary'
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>
                    Dashboard ({user?.firstName || 'User'})
                  </Button>
                </Link>
                <Button variant="outline" size="sm" fullWidth onClick={handleLogout} leftIcon={LogOut}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

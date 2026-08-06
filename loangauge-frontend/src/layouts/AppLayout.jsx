import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/store/authSlice';
import { useLogoutMutation } from '@/services/authApi';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/services/notificationApi';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Container } from '@/components/ui/Container';

const getNavigationLinks = (role) => {
  const commonLinks = [
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Financial Profile', to: '/financial-profile' },
    { name: 'Assessments', to: '/assessments' },
    { name: 'Goals', to: '/goals' },
    { name: 'Settings', to: '/settings' },
  ];

  if (role === 'ADMINISTRATOR') {
    return [
      { name: 'Dashboard', to: '/dashboard' },
      { name: 'Admin Overview', to: '/admin' },
      { name: 'User Management', to: '/admin/users' },
      { name: 'Subscription Plans', to: '/admin/subscriptions' },
      { name: 'Loan Products', to: '/admin/loan-types' },
      { name: 'Assessments', to: '/assessments' },
      { name: 'Settings', to: '/settings' },
    ];
  }

  if (role === 'FINANCIAL_ADVISOR') {
    return [
      { name: 'Dashboard', to: '/dashboard' },
      { name: 'Advisor Portal', to: '/advisor' },
      { name: 'Consultation Requests', to: '/consultations' },
      { name: 'Assessments', to: '/assessments' },
      { name: 'Settings', to: '/settings' },
    ];
  }

  if (role === 'PREMIUM_USER') {
    return [
      ...commonLinks,
      { name: 'Advisor Consultations', to: '/consultations' },
    ];
  }

  return [
    ...commonLinks,
    { name: 'Upgrade to Premium', to: '/upgrade' },
  ];
};

const AppLayout = () => {
  const { user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { data: notifications = [] } = useGetNotificationsQuery(user?.id, {
    skip: !user?.id,
  });
  const [markAsRead] = useMarkAsReadMutation();

  const navLinks = getNavigationLinks(role);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <Sidebar
        navLinks={navLinks}
        user={user}
        role={role}
        onLogout={handleLogout}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setIsMobileNavOpen(true)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          user={user}
          role={role}
          onLogout={handleLogout}
        />

        <main className="flex-1 py-6 sm:py-8">
          <Container size="xl">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

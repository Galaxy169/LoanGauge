import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';

const RoleGuard = ({ allowedRoles }) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-6 bg-surface-sunken">
        <Card className="max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-risk-high/10 p-4">
              <ShieldX className="h-12 w-12 text-risk-high" />
            </div>
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-8 font-body">
            You do not have the required permissions to view this page. If you believe this is an error, please contact support.
          </p>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleGuard;

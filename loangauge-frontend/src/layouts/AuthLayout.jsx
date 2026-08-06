import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-sunken px-4 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Gauge size={19} />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-[17px] font-bold text-text-primary">LoanGauge</p>
          <p className="text-[11px] font-medium text-text-muted">Financial Readiness Engine</p>
        </div>
      </Link>

      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Outlet />
      </div>

      <p className="mt-6 text-xs text-text-muted">
        &copy; {new Date().getFullYear()} LoanGauge Technologies Ltd.
      </p>
    </div>
  );
};

export default AuthLayout;

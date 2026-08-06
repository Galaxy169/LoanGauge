import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Target, MessageSquare, Users, TrendingUp, CreditCard, ArrowRight, UserCircle } from 'lucide-react';
import { useGetDashboardQuery, useGetUsersQuery } from '@/services/adminApi';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNumber } from '@/utils/helpers';

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <Card className={`p-5 flex flex-col justify-between space-y-3 ${highlight ? 'bg-primary-50 border-primary-100' : ''}`}>
      <div className="flex justify-between items-center">
        <span className={`text-xs uppercase font-bold ${highlight ? 'text-primary-700' : 'text-text-muted'}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-primary-100 text-primary-700' : 'bg-surface-hover text-text-primary'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className={`text-2xl font-bold font-mono ${highlight ? 'text-primary-800' : 'text-text-primary'}`}>
        {formatNumber(value)}
      </h3>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery();
  const { data: usersData = [], isLoading: isUsersLoading } = useGetUsersQuery();

  // API returns these fields flat under `data`, not nested under a `stats` key:
  // { totalAssessments, totalGoals, pendingConsultations, totalProfiles }
  const stats = dashboardData?.data || dashboardData || {};
  const users = Array.isArray(usersData) ? usersData : [];

  if (isLoading || isUsersLoading) return <PageLoader />;

  if (error) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Dashboard Analytics Error"
        description="Failed to load platform admin dashboard telemetry. Please refresh."
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="System Administration"
        title="Admin Dashboard Overview"
        description="Platform operational telemetry, user growth metrics, and active consultation queues."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Registered Users" value={users.length} />
        <StatCard icon={UserCircle} label="Financial Profiles" value={stats.totalProfiles} />
        <StatCard icon={FileText} label="Assessments Evaluated" value={stats.totalAssessments} />
        <StatCard icon={Target} label="Active Goals Defined" value={stats.totalGoals} />
        <StatCard icon={MessageSquare} label="Pending Consultations" value={stats.pendingConsultations} highlight />
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">Console Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users" className="block">
            <Card className="p-5 space-y-2" interactive>
              <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text-primary">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between">
                <span>User Directory</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </h3>
              <p className="text-xs text-text-secondary">Manage user roles, security access levels, and suspension statuses.</p>
            </Card>
          </Link>

          <Link to="/admin/subscriptions" className="block">
            <Card className="p-5 space-y-2" interactive>
              <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text-primary">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between">
                <span>Subscription Plans</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </h3>
              <p className="text-xs text-text-secondary">Configure premium membership tiers, annual pricing, and feature flags.</p>
            </Card>
          </Link>

          <Link to="/admin/loan-types" className="block">
            <Card className="p-5 space-y-2" interactive>
              <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between">
                <span>Loan Products</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </h3>
              <p className="text-xs text-text-secondary">Set lending benchmarks, base interest rates, and max repayment terms.</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

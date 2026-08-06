import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Loader';
import { useGetGoalsQuery } from '@/services/goalApi';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function GoalsPage() {
  const navigate = useNavigate();
  const { data: goalsData = [], isLoading } = useGetGoalsQuery();

  const goals = Array.isArray(goalsData) ? goalsData : [];

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Financial Targets</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1 flex items-center gap-2">
            Savings & Financial Goals
            <Badge variant="default">{goals.length} Active</Badge>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Track target savings dates, monthly requirement metrics, and completion progress.</p>
        </div>

        <Button 
          variant="primary" 
          size="sm"
          onClick={() => navigate('/goals/new')}
          leftIcon={Plus}
        >
          Set New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Financial Goals Set Yet"
          description="Create savings targets for home down-payments, emergency reserves, or loan payoff funds."
          action={
            <Button variant="primary" size="md" onClick={() => navigate('/goals/new')}>
              Set First Savings Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const goalId = goal.goalId || goal.id;
            return (
              <Link key={goalId} to={`/goals/${goalId}`} className="block">
                <Card className="p-4 border-border bg-white rounded space-y-3 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-text-primary text-base">{goal.goalName}</h3>
                      <span className="text-xs font-bold text-text-primary bg-surface-hover px-2 py-0.5 rounded border border-border">
                        {goal.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-ink-200 rounded h-2 overflow-hidden">
                      <div 
                        className="bg-primary-600 h-2 rounded" 
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-text-muted">Saved / Target:</span>
                        <p className="font-bold text-text-primary">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-text-muted">Target Date:</span>
                        <p className="font-bold text-text-primary">{formatDate(goal.targetDate).split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-text-secondary">
                    <span>Monthly Requirement:</span>
                    <span className="text-text-primary font-bold">{formatCurrency(goal.requiredMonthlySavings)}/mo</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


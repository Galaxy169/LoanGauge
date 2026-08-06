import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Edit2, Trash2, Target, Plus, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Loader';
import { useToastContext } from '@/context/ToastContext';
import { useGetGoalQuery, useUpdateGoalProgressMutation, useDeleteGoalMutation } from '@/services/goalApi';
import { goalProgressSchema } from '@/validators/goal.validators';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/helpers';

export default function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: goalData, isLoading, error } = useGetGoalQuery(id);
  const [updateProgress, { isLoading: isUpdating }] = useUpdateGoalProgressMutation();
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();

  const goal = goalData?.data || goalData;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(goalProgressSchema),
    defaultValues: {
      currentAmount: goal?.currentAmount || 0
    }
  });

  React.useEffect(() => {
    if (goal) {
      reset({ currentAmount: goal.currentAmount });
    }
  }, [goal, reset]);

  const onUpdateProgress = async (data) => {
    try {
      await updateProgress({ id, currentAmount: Number(data.currentAmount) }).unwrap();
      toast.success('Goal savings progress updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal(id).unwrap();
      toast.success('Financial goal removed.');
      navigate('/goals');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !goal) return <div className="p-8 text-center text-text-muted font-sans">Savings goal not found.</div>;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressPct = Math.min(100, Math.max(0, goal.progressPercentage || 0));
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/goals" className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Goal Details</span>
            <h1 className="text-2xl font-bold text-text-primary">{goal.goalName}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/goals/${id}/edit`)} leftIcon={Edit2}>
            Edit Goal
          </Button>
          <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)} leftIcon={Trash2}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Progress Gauge */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center justify-center bg-white border-border rounded">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90" cy="90" r={radius}
                className="stroke-border fill-none"
                strokeWidth="12"
              />
              <circle
                cx="90" cy="90" r={radius}
                className="stroke-primary-600 fill-none"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">{progressPct}%</span>
              <span className="text-[10px] text-text-muted uppercase">Progress</span>
            </div>
          </div>
          <div className="mt-4 text-center w-full">
            <Badge variant="default">
              {goal.status?.replace('_', ' ') || 'ACTIVE'}
            </Badge>
          </div>
        </Card>

        {/* Target Info Cards */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6 bg-white border-border rounded space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <Target className="w-5 h-5" />
              <h3 className="text-base font-bold text-text-primary">Target Parameters</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted uppercase">Target Savings Goal</span>
                <p className="text-xl font-bold text-text-primary mt-0.5">{formatCurrency(goal.targetAmount)}</p>
              </div>
              <div>
                <span className="text-text-muted uppercase">Target Completion Date</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{formatDate(goal.targetDate).split(',')[0]}</p>
              </div>
              <div>
                <span className="text-text-muted uppercase">Time Horizon</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{goal.monthsRemaining || 12} Months</p>
              </div>
              <div>
                <span className="text-text-muted uppercase">Required Monthly Savings</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{formatCurrency(goal.requiredMonthlySavings)}/mo</p>
              </div>
            </div>

            {goal.notes && (
              <div className="pt-3 border-t border-border space-y-1">
                <span className="text-xs uppercase text-text-muted">Strategy Notes</span>
                <p className="text-xs text-text-secondary leading-relaxed">{goal.notes}</p>
              </div>
            )}
          </Card>

          {/* Update Progress Form */}
          <Card className="p-5 bg-white border-border rounded space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Update Savings Progress</h3>
            <form onSubmit={handleSubmit(onUpdateProgress)} className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Current Saved Amount (₹)"
                  type="number"
                  placeholder="50000"
                  {...register('currentAmount', { valueAsNumber: true })}
                  error={errors.currentAmount?.message}
                />
              </div>
              <Button type="submit" variant="primary" isLoading={isUpdating} rightIcon={Plus}>
                Update
              </Button>
            </form>
            <div className="flex justify-between items-center text-xs text-text-secondary pt-1">
              <span>Remaining Target: <strong className="text-text-primary">{formatCurrency(goal.remainingAmount || Math.max(0, goal.targetAmount - goal.currentAmount))}</strong></span>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Financial Goal"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-3 text-text-primary font-sans">
          <div className="w-10 h-10 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-base text-text-primary">Delete "{goal.goalName}"?</p>
            <p className="text-text-secondary text-xs">This will permanently remove savings tracking for this goal.</p>
          </div>
          <div className="flex gap-2 w-full pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={isDeleting}>
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


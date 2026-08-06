import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Loader';
import { useToastContext } from '@/context/ToastContext';
import { useGetGoalQuery, useCreateGoalMutation, useUpdateGoalMutation } from '@/services/goalApi';
import { goalSchema } from '@/validators/goal.validators';
import { getErrorMessage } from '@/utils/helpers';

export default function GoalFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const toast = useToastContext();

  const { data: goal, isLoading: isGoalLoading } = useGetGoalQuery(id, { skip: !isEditMode });
  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalName: '',
      targetAmount: 100000,
      currentAmount: 10000,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    }
  });

  useEffect(() => {
    if (isEditMode && goal) {
      reset({
        goalName: goal.goalName || '',
        targetAmount: goal.targetAmount || 0,
        currentAmount: goal.currentAmount || 0,
        targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
        notes: goal.notes || ''
      });
    }
  }, [isEditMode, goal, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        targetAmount: Number(data.targetAmount),
        currentAmount: Number(data.currentAmount || 0),
        // API expects a plain ISO date (YYYY-MM-DD) — the <input type="date">
        // value is already in that format, so send it as-is rather than
        // expanding to a full ISO datetime string.
        targetDate: data.targetDate
      };
      
      if (isEditMode) {
        await updateGoal({ id, ...payload }).unwrap();
        toast.success('Goal updated successfully');
        navigate(`/goals/${id}`);
      } else {
        await createGoal(payload).unwrap();
        toast.success('Goal created successfully');
        navigate('/goals');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isEditMode && isGoalLoading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex items-center gap-3">
        <Link to={isEditMode ? `/goals/${id}` : '/goals'} className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{isEditMode ? 'Edit Goal' : 'Create New Goal'}</h1>
          <p className="text-xs text-text-secondary">{isEditMode ? 'Update your financial goal parameters' : 'Set a target savings goal for your future'}</p>
        </div>
      </div>

      <Card className="p-6 border-border bg-white rounded space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g., Down Payment for Dream Home"
            {...register('goalName')}
            error={errors.goalName?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Goal Amount (₹)"
              type="number"
              placeholder="500000"
              {...register('targetAmount', { valueAsNumber: true })}
              error={errors.targetAmount?.message}
            />
            
            <Input
              label="Current Initial Savings (₹)"
              type="number"
              placeholder="50000"
              {...register('currentAmount', { valueAsNumber: true })}
              error={errors.currentAmount?.message}
              helperText="Initial amount already saved"
            />
          </div>

          <Input
            label="Target Completion Date"
            type="date"
            {...register('targetDate')}
            error={errors.targetDate?.message}
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">
              Notes & Strategy (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded border border-border-strong bg-white p-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500"
              placeholder="E.g., Save ₹15,000 monthly in liquid funds..."
              {...register('notes')}
            ></textarea>
            {errors.notes && (
              <p className="text-xs text-text-secondary mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(isEditMode ? `/goals/${id}` : '/goals')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isCreating || isUpdating}
              rightIcon={Save}
            >
              {isEditMode ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


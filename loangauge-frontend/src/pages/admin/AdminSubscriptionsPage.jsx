import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2 } from 'lucide-react';
import { useGetSubscriptionsQuery, useCreateSubscriptionMutation, useUpdateSubscriptionMutation } from '@/services/adminApi';
import { subscriptionSchema } from '@/validators/admin.validators';
import { useToastContext } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Loader';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/Table';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';

export default function AdminSubscriptionsPage() {
  const { data: plansData = [], isLoading, error } = useGetSubscriptionsQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
  const toast = useToastContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const plans = Array.isArray(plansData) ? plansData : [];

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      planName: '',
      price: 999,
      status: 'ACTIVE'
    }
  });

  const handleOpenModal = (plan = null) => {
    setEditingPlan(plan);
    if (plan) {
      setValue('planName', plan.planName);
      setValue('price', plan.price);
      setValue('status', plan.status || 'ACTIVE');
    } else {
      reset({ planName: '', price: 999, status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price)
      };

      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, ...payload }).unwrap();
        toast.success('Subscription plan updated successfully!');
      } else {
        await createPlan(payload).unwrap();
        toast.success('Subscription plan created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;
  if (error) return <div className="p-8 text-center text-text-primary font-sans">Failed to load subscription catalog</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6 font-sans text-text-primary">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Monetization Catalog</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1">
            Subscription Plans & Tier Pricing
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Configure premium tier offerings, pricing parameters, and feature statuses.
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()} rightIcon={Plus}>
          Create New Plan
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-border bg-white rounded">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Plan Name</TableHeader>
              <TableHeader>Annual Price</TableHeader>
              <TableHeader>Catalog Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-text-muted text-xs">
                  No subscription plans defined in database catalog.
                </TableCell>
              </TableRow>
            ) : (
              plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell className="font-bold text-text-primary">
                    {plan.planName}
                  </TableCell>
                  <TableCell className="text-base font-bold text-text-primary">
                    {formatCurrency(plan.price)}
                  </TableCell>
                  <TableCell>
                    {plan.status === 'ACTIVE' ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenModal(plan)}
                      leftIcon={Edit2}
                    >
                      Edit Config
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Subscription Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Plan Name"
            {...register('planName')}
            error={errors.planName?.message}
            placeholder="e.g., Premium Annual Pass"
          />
          
          <Input
            type="number"
            label="Annual Subscription Price (₹)"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="999"
          />
          
          <Select
            label="Plan Status"
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'ACTIVE', label: 'Active (Available for Upgrade)' },
              { value: 'INACTIVE', label: 'Inactive (Hidden)' }
            ]}
          />
          
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating || isUpdating}>
              {editingPlan ? 'Save Plan Edits' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

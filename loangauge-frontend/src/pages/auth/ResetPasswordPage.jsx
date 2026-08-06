import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPasswordSchema } from '@/validators/auth.validators';
import { useResetPasswordMutation } from '@/services/authApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/helpers';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPasswordApi, { isLoading }] = useResetPasswordMutation();

  const [apiError, setApiError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      await resetPasswordApi(data).unwrap();
      setIsSuccess(true);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold font-heading text-text-primary">Invalid Link</h2>
        <p className="text-xs text-text-secondary">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link to="/forgot-password">
          <Button fullWidth>Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary">Password Reset Successful</h2>
        <p className="text-xs text-text-secondary">
          Your password has been changed successfully. You can now log in with your new password.
        </p>
        <Link to="/login">
          <Button fullWidth>Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold font-heading text-text-primary">Set New Password</h2>
        <p className="text-xs text-text-secondary">Create a secure new password for your account</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-subtle px-3.5 py-3 text-xs font-medium text-danger">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">New Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Confirm New Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} fullWidth size="lg">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;

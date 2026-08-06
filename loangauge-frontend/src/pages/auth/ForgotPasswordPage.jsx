import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema } from '@/validators/auth.validators';
import { useForgotPasswordMutation } from '@/services/authApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/helpers';

const ForgotPasswordPage = () => {
  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();
  const [apiError, setApiError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      await forgotPasswordApi(data).unwrap();
      setIsSuccess(true);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary">Check Your Email</h2>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-text-secondary">
          If an account exists with that email, we've dispatched password recovery instructions to your inbox.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button fullWidth variant="outline" size="md">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold font-heading text-text-primary">Reset Password</h2>
        <p className="text-xs text-text-secondary">
          Enter your registered email address to receive a recovery link
        </p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-subtle px-3.5 py-3 text-xs font-medium text-danger">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth size="lg">
          Send Password Reset Link
        </Button>
      </form>

      <div className="pt-1 text-center text-xs text-text-secondary">
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginSchema } from '@/validators/auth.validators';
import { useLoginMutation } from '@/services/authApi';
import { setCredentials } from '@/store/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/helpers';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginApi, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      const response = await loginApi(data).unwrap();

      const authData = response.data || response;
      const user = authData.user;
      const accessToken = authData.accessToken || authData.token;

      if (!accessToken || !user) {
        throw new Error("Invalid response format from server");
      }

      dispatch(setCredentials({ user, accessToken }));
      navigate('/dashboard');
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold font-heading text-text-primary">Welcome Back</h2>
        <p className="text-sm text-text-secondary">Sign in to your LoanGauge account</p>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text-secondary">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
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

        <Button type="submit" isLoading={isLoading} fullWidth size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

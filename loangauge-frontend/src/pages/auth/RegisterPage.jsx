import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { registerSchema } from '@/validators/auth.validators';
import { useRegisterMutation } from '@/services/authApi';
import { setCredentials } from '@/store/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/helpers';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerApi, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      const response = await registerApi(data).unwrap();

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
        <h2 className="text-xl font-bold font-heading text-text-primary">Create Your Account</h2>
        <p className="text-sm text-text-secondary">Begin your financial readiness journey</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-subtle px-3.5 py-3 text-xs font-medium text-danger">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            placeholder="Aditya"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="Kumar"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="9876543210"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Password</label>
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

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Confirm Password</label>
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
          Register
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;

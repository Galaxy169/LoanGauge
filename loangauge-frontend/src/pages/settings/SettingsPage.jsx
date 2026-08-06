import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Shield, User, Eye, EyeOff, Lock } from 'lucide-react';
import { userProfileSchema, changePasswordSchema } from '@/validators/profile.validators';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@/services/userApi';
import { useAuth } from '@/hooks/useAuth';
import { updateUser } from '@/store/authSlice';
import { useToastContext } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Loader';
import { getErrorMessage } from '@/utils/helpers';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const dispatch = useDispatch();
  const toast = useToastContext();
  const { user } = useAuth();

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    skip: !user
  });
  const [updateProfileApi, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const profile = profileData || user || {};

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    }
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (profile) {
      resetProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || ''
      });
    }
  }, [profile, resetProfile]);

  const onProfileSubmit = async (data) => {
    try {
      const response = await updateProfileApi(data).unwrap();
      const updatedUser = response.data || response;
      dispatch(updateUser(updatedUser));
      toast.success('Account profile updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePasswordApi(data).unwrap();
      resetPassword();
      toast.success('Security password updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isProfileLoading && !user) return <PageLoader />;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-sans text-text-primary">
      <div className="pb-4 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Account Hub</span>
        <h1 className="text-2xl font-bold text-text-primary mt-1">Account & Security Settings</h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">Manage personal contact info, user credentials, and security options.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 flex md:flex-col gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs uppercase tracking-wider font-semibold cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <User className="h-4 w-4" />
            Profile Info
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs uppercase tracking-wider font-semibold cursor-pointer ${
              activeTab === 'security'
                ? 'bg-primary-600 text-white'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <Shield className="h-4 w-4" />
            Security & Passwords
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1">
          <Card className="p-6 border-border bg-white rounded">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-border">
                  <h2 className="text-lg font-bold text-text-primary">Personal Details</h2>
                  <p className="text-xs text-text-secondary">Update your display name and contact phone number.</p>
                </div>

                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      {...registerProfile('firstName')}
                      error={profileErrors.firstName?.message}
                    />
                    <Input
                      label="Last Name"
                      {...registerProfile('lastName')}
                      error={profileErrors.lastName?.message}
                    />
                  </div>
                  
                  <Input
                    label="Registered Email Address"
                    value={profile?.email || user?.email || ''}
                    disabled
                    helperText="Email address is tied to authentication and cannot be changed"
                  />
                  
                  <Input
                    label="Contact Phone Number"
                    type="tel"
                    placeholder="+91 9876543210"
                    {...registerProfile('phone')}
                    error={profileErrors.phone?.message}
                  />

                  <div className="pt-3 border-t border-border flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-border">
                  <h2 className="text-lg font-bold text-text-primary">Change Password</h2>
                  <p className="text-xs text-text-secondary">Ensure your password is at least 8 characters long.</p>
                </div>

                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 max-w-md">
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showOldPassword ? 'text' : 'password'}
                      {...registerPassword('oldPassword')}
                      error={passwordErrors.oldPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-[30px] text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword')}
                      error={passwordErrors.newPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-[30px] text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerPassword('confirmPassword')}
                      error={passwordErrors.confirmPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[30px] text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isChangingPassword} rightIcon={Lock}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


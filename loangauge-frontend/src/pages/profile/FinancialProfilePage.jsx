import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Briefcase,
  Save,
  Gauge as GaugeIcon,
  PiggyBank,
  Wallet,
  User,
} from 'lucide-react';

import {
  useGetFinancialProfileQuery,
  useCreateFinancialProfileMutation,
  useUpdateFinancialProfileMutation,
  useCheckProfileExistsQuery
} from '@/services/financialProfileApi';
import { financialProfileSchema } from '@/validators/profile.validators';
import { useToastContext } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoader } from '@/components/ui/Loader';
import { Gauge } from '@/components/ui/Gauge';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const CITY_TYPE_OPTIONS = [
  { value: 'METRO', label: 'Metro City (Tier 1)' },
  { value: 'URBAN', label: 'Urban (Tier 2)' },
  { value: 'SEMI_URBAN', label: 'Semi-Urban (Tier 3)' },
  { value: 'RURAL', label: 'Rural' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'SALARIED', label: 'Salaried Professional' },
  { value: 'SELF_EMPLOYED', label: 'Self Employed Professional' },
  { value: 'BUSINESS', label: 'Business Owner' },
  { value: 'FREELANCER', label: 'Freelancer / Consultant' },
];

const INCOME_STABILITY_OPTIONS = [
  { value: 'STABLE', label: 'Stable (Consistent Monthly Income)' },
  { value: 'MODERATE', label: 'Moderate (Minor Monthly Fluctuations)' },
  { value: 'UNSTABLE', label: 'Variable (High Income Volatility)' },
];

const DEFAULT_VALUES = {
  age: 28,
  maritalStatus: 'SINGLE',
  dependents: 0,
  cityType: 'METRO',
  employmentType: 'SALARIED',
  workExperienceYears: 3,
  incomeStability: 'STABLE',
  monthlyIncome: 100000,
  monthlyExpenses: 35000,
  existingLoans: 1,
  monthlyEmi: 15000,
  creditCardBalance: 5000,
  savings: 200000,
  fixedDeposits: 0,
  investments: 0,
  emergencyFund: 150000,
  // Left blank rather than guessed — cibilScore is optional. Leaving it
  // unset sends null to the backend, which substitutes its own neutral
  // default score rather than us pre-filling a number the user never
  // actually confirmed.
  cibilScore: '',
  creditUtilization: 25,
  notes: '',
};

export default function FinancialProfilePage() {
  const toast = useToastContext();

  const { data: profileExists, isLoading: isExistsLoading } = useCheckProfileExistsQuery();
  const { data: profileData, isLoading: isProfileLoading } = useGetFinancialProfileQuery(undefined, {
    skip: !profileExists
  });

  const [createProfile, { isLoading: isCreating }] = useCreateFinancialProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateFinancialProfileMutation();

  const isEditMode = Boolean(profileExists);
  const isLoading = isExistsLoading || (isEditMode && isProfileLoading);
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const cibilScoreRaw = watch('cibilScore');
  // NaN shows up here while the field is blank, since the input uses
  // valueAsNumber — treat that the same as "not provided."
  const hasCibilScore = cibilScoreRaw !== '' && cibilScoreRaw !== undefined && cibilScoreRaw !== null && !Number.isNaN(cibilScoreRaw);
  const monthlyIncomeValue = watch('monthlyIncome') || 0;
  const monthlyExpensesValue = watch('monthlyExpenses') || 0;
  const monthlyEmiValue = watch('monthlyEmi') || 0;

  const netDisposableIncome = Math.max(0, monthlyIncomeValue - monthlyExpensesValue - monthlyEmiValue);

  useEffect(() => {
    if (profileData) {
      const data = profileData.data || profileData;
      reset({
        age: data.age ?? DEFAULT_VALUES.age,
        maritalStatus: data.maritalStatus || DEFAULT_VALUES.maritalStatus,
        dependents: data.dependents ?? DEFAULT_VALUES.dependents,
        cityType: data.cityType || DEFAULT_VALUES.cityType,
        employmentType: data.employmentType || DEFAULT_VALUES.employmentType,
        workExperienceYears: data.workExperienceYears ?? DEFAULT_VALUES.workExperienceYears,
        incomeStability: data.incomeStability || DEFAULT_VALUES.incomeStability,
        monthlyIncome: data.monthlyIncome ?? DEFAULT_VALUES.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses ?? DEFAULT_VALUES.monthlyExpenses,
        existingLoans: data.existingLoans ?? DEFAULT_VALUES.existingLoans,
        monthlyEmi: data.monthlyEmi ?? DEFAULT_VALUES.monthlyEmi,
        creditCardBalance: data.creditCardBalance ?? DEFAULT_VALUES.creditCardBalance,
        savings: data.savings ?? DEFAULT_VALUES.savings,
        fixedDeposits: data.fixedDeposits ?? DEFAULT_VALUES.fixedDeposits,
        investments: data.investments ?? DEFAULT_VALUES.investments,
        emergencyFund: data.emergencyFund ?? DEFAULT_VALUES.emergencyFund,
        cibilScore: data.cibilScore ?? DEFAULT_VALUES.cibilScore,
        creditUtilization: data.creditUtilization ?? DEFAULT_VALUES.creditUtilization,
        notes: data.notes || '',
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        age: Number(formData.age),
        maritalStatus: formData.maritalStatus,
        dependents: Number(formData.dependents),
        cityType: formData.cityType,
        employmentType: formData.employmentType,
        workExperienceYears: Number(formData.workExperienceYears),
        incomeStability: formData.incomeStability,
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingLoans: Number(formData.existingLoans),
        monthlyEmi: Number(formData.monthlyEmi),
        creditCardBalance: Number(formData.creditCardBalance),
        savings: Number(formData.savings),
        fixedDeposits: Number(formData.fixedDeposits || 0),
        investments: Number(formData.investments || 0),
        emergencyFund: Number(formData.emergencyFund),
        // Already either `null` or a validated 300–900 number courtesy of
        // the schema's preprocess step — do NOT run this through Number(),
        // since Number(null) is 0, which would silently turn "no score
        // provided" into a fake score of 0 instead of sending null.
        cibilScore: formData.cibilScore,
        creditUtilization: Number(formData.creditUtilization),
        notes: formData.notes || '',
      };

      if (isEditMode) {
        await updateProfile(payload).unwrap();
        toast.success('Financial profile updated successfully!');
      } else {
        await createProfile(payload).unwrap();
        toast.success('Financial profile created successfully!');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Calibration Baseline"
        title="Financial Profile"
        description="Maintain your income, debt, assets, and credit score parameters to evaluate loan eligibility."
        actions={<Badge variant={isEditMode ? 'success' : 'warning'}>{isEditMode ? 'Profile Complete' : 'Action Required'}</Badge>}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <User size={16} />
              <h2 className="text-sm font-bold text-text-primary">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
              />
              <Select
                label="Marital Status"
                options={MARITAL_STATUS_OPTIONS}
                {...register('maritalStatus')}
                error={errors.maritalStatus?.message}
              />
              <Input
                label="Dependents"
                type="number"
                {...register('dependents', { valueAsNumber: true })}
                error={errors.dependents?.message}
                helperText="Number of financial dependents"
              />
            </div>
          </div>

          {/* Section 2: Income & Employment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <Briefcase size={16} />
              <h2 className="text-sm font-bold text-text-primary">Income & Employment</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Income (₹)"
                type="number"
                {...register('monthlyIncome', { valueAsNumber: true })}
                error={errors.monthlyIncome?.message}
                helperText="Gross monthly take-home salary or profit"
              />
              <Select
                label="Employment Category"
                options={EMPLOYMENT_TYPE_OPTIONS}
                {...register('employmentType')}
                error={errors.employmentType?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Income Stability"
                options={INCOME_STABILITY_OPTIONS}
                {...register('incomeStability')}
                error={errors.incomeStability?.message}
              />
              <Select
                label="City / Region Tier"
                options={CITY_TYPE_OPTIONS}
                {...register('cityType')}
                error={errors.cityType?.message}
              />
              <Input
                label="Work Experience (Years)"
                type="number"
                {...register('workExperienceYears', { valueAsNumber: true })}
                error={errors.workExperienceYears?.message}
              />
            </div>
          </div>

          {/* Section 3: Expenses & Debt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <PiggyBank size={16} />
              <h2 className="text-sm font-bold text-text-primary">Expenses & Debt Obligations</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Living Expenses (₹)"
                type="number"
                {...register('monthlyExpenses', { valueAsNumber: true })}
                error={errors.monthlyExpenses?.message}
                helperText="Rent, groceries, utilities, and lifestyle spending"
              />
              <Input
                label="Total Existing Monthly EMI (₹)"
                type="number"
                {...register('monthlyEmi', { valueAsNumber: true })}
                error={errors.monthlyEmi?.message}
                helperText="Combined monthly payments across all active loans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Number of Existing Loans"
                type="number"
                {...register('existingLoans', { valueAsNumber: true })}
                error={errors.existingLoans?.message}
              />
              <Input
                label="Outstanding Credit Card Balance (₹)"
                type="number"
                {...register('creditCardBalance', { valueAsNumber: true })}
                error={errors.creditCardBalance?.message}
              />
            </div>

            <div className="p-3 rounded-lg bg-surface-sunken flex justify-between items-center text-xs">
              <span className="text-text-secondary">Net Disposable Monthly Cashflow:</span>
              <span className="text-sm font-bold font-mono text-text-primary">{formatCurrency(netDisposableIncome)}</span>
            </div>
          </div>

          {/* Section 4: Savings & Assets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <Wallet size={16} />
              <h2 className="text-sm font-bold text-text-primary">Savings & Assets</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Liquid Savings (₹)"
                type="number"
                {...register('savings', { valueAsNumber: true })}
                error={errors.savings?.message}
              />
              <Input
                label="Emergency Fund (₹)"
                type="number"
                {...register('emergencyFund', { valueAsNumber: true })}
                error={errors.emergencyFund?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fixed Deposits (₹, optional)"
                type="number"
                {...register('fixedDeposits', { valueAsNumber: true })}
                error={errors.fixedDeposits?.message}
              />
              <Input
                label="Investments (₹, optional)"
                type="number"
                {...register('investments', { valueAsNumber: true })}
                error={errors.investments?.message}
              />
            </div>
          </div>

          {/* Section 5: Credit Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <GaugeIcon size={16} />
              <h2 className="text-sm font-bold text-text-primary">Credit Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 space-y-4">
                <Input
                  label="CIBIL / Credit Score (300 – 900, optional)"
                  type="number"
                  {...register('cibilScore', { valueAsNumber: true })}
                  error={errors.cibilScore?.message}
                  helperText="Leave blank if you don't know it — a neutral baseline is used instead. If provided, it must be between 300 and 900."
                />
                <Input
                  label="Credit Utilization (%)"
                  type="number"
                  step="0.1"
                  {...register('creditUtilization', { valueAsNumber: true })}
                  error={errors.creditUtilization?.message}
                  helperText="Share of available credit currently in use"
                />
              </div>

              <div className="md:col-span-5 flex justify-center p-3 bg-surface-sunken rounded-lg">
                <Gauge
                  value={hasCibilScore ? Math.round(((cibilScoreRaw - 300) / 600) * 100) : 50}
                  size="sm"
                  label={hasCibilScore ? `CIBIL SCORE: ${cibilScoreRaw}` : 'NEUTRAL BASELINE (NO SCORE)'}
                />
              </div>
            </div>

            <Textarea
              label="Notes (Optional)"
              rows={3}
              placeholder="Any additional context for your financial situation..."
              {...register('notes')}
              error={errors.notes?.message}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving} rightIcon={Save}>
              {isEditMode ? 'Save Profile Edits' : 'Create Financial Profile'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}

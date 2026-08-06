import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Check, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loader';
import { useToastContext } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useGetLoanTypesQuery } from '@/services/loanTypeApi';
import { useCreateAssessmentMutation, useGetAssessmentHistoryQuery } from '@/services/assessmentApi';
import { useCheckProfileExistsQuery } from '@/services/financialProfileApi';
import { assessmentSchema } from '@/validators/assessment.validators';
import { formatPercent, formatCurrency, getErrorMessage } from '@/utils/helpers';

function rateRangeLabel(loanType) {
  if (loanType.minInterestRate != null && loanType.maxInterestRate != null) {
    return `${formatPercent(loanType.minInterestRate)} – ${formatPercent(loanType.maxInterestRate)}`;
  }
  return formatPercent(loanType.interestRate);
}

function amountRangeLabel(loanType) {
  if (loanType.minLoanAmount != null && loanType.maxLoanAmount != null) {
    return `${formatCurrency(loanType.minLoanAmount)} – ${formatCurrency(loanType.maxLoanAmount)}`;
  }
  return null;
}

export default function NewAssessmentPage() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const { isUser, isPremium } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedLoanType, setSelectedLoanType] = useState(null);

  const { data: profileExists, isLoading: isProfileLoading } = useCheckProfileExistsQuery();
  const { data: loanTypesData = [], isLoading: isLoanTypesLoading } = useGetLoanTypesQuery();
  const { data: assessmentsData = [], isLoading: isAssessmentsLoading } = useGetAssessmentHistoryQuery();
  const [createAssessment, { isLoading: isSubmitting }] = useCreateAssessmentMutation();

  const allLoanTypes = Array.isArray(loanTypesData) ? loanTypesData : [];
  // Deactivated products (isActive: false) shouldn't be selectable by borrowers,
  // only managed from the admin catalog.
  const loanTypes = allLoanTypes.filter((lt) => lt.isActive !== false);
  const assessments = Array.isArray(assessmentsData) ? assessmentsData : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      loanAmount: 500000,
      tenureMonths: 24,
      interestRate: 8.5,
      loanTypeId: 1
    }
  });

  const tenureMonthsValue = watch('tenureMonths') || 24;

  const hasReachedLimit = isUser && !isPremium && assessments.length >= 3;

  const handleLoanTypeSelect = (loanType) => {
    const typeId = loanType.loanTypeId || loanType.id;
    const rate = loanType.interestRate ?? 8.5;
    const minTenure = loanType.minTenureMonths || 6;
    const maxTenure = loanType.maxTenureMonths || 60;

    setSelectedLoanType(loanType);
    setValue('loanTypeId', Number(typeId));
    setValue('interestRate', Number(rate));
    setValue('tenureMonths', Math.min(Math.max(36, minTenure), maxTenure));
    setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        loanTypeId: Number(data.loanTypeId),
        loanAmount: Number(data.loanAmount),
        tenureMonths: Number(data.tenureMonths),
        interestRate: Number(data.interestRate)
      };

      const response = await createAssessment(payload).unwrap();
      const assessmentResult = response.data || response;
      const targetId = assessmentResult.assessmentId || assessmentResult.id;

      toast.success('Assessment calibrated successfully!');
      if (targetId) {
        navigate(`/assessments/${targetId}`);
      } else {
        navigate('/assessments');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isProfileLoading || isLoanTypesLoading || isAssessmentsLoading) {
    return <PageLoader />;
  }

  if (hasReachedLimit) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-6 text-center bg-white border border-border rounded space-y-3">
          <Badge variant="default" className="mx-auto">Free Tier Limit Reached</Badge>
          <h2 className="text-xl font-bold text-text-primary">3 Free Assessments Used</h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-md mx-auto">
            You have reached the maximum limit of 3 free assessments. Upgrade to Premium for unlimited assessment calibrations and 1-on-1 financial advisor reviews.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/upgrade')}>
            Upgrade to Premium Now
          </Button>
        </Card>
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-6 text-center bg-white border border-border rounded space-y-3">
          <Badge variant="default" className="mx-auto">Action Required</Badge>
          <h2 className="text-xl font-bold text-text-primary">Financial Profile Required</h2>
          <p className="text-text-secondary text-xs sm:text-sm max-w-md mx-auto">
            Please build your financial profile first so our algorithms can evaluate your income, DTI, and FOIR metrics accurately.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/financial-profile')}>
            Build Financial Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      {/* Header Title */}
      <div className="text-center space-y-1">
        <Badge variant="default">Step 2 of 2</Badge>
        <h1 className="text-2xl font-bold text-text-primary">Run Readiness Assessment</h1>
        <p className="text-text-secondary text-xs sm:text-sm max-w-lg mx-auto">
          Configure your loan parameters to generate an instant precision calibration report.
        </p>
      </div>

      {/* Progress Wizard Bar */}
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded border border-border">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-primary-600 text-white' : 'bg-ink-200 text-text-secondary'}`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className={`text-xs font-medium ${step === 1 ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>Choose Loan Type</span>
          </div>
          <div className="w-8 h-px bg-ink-200"></div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary-600 text-white' : 'bg-ink-200 text-text-muted'}`}>
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? 'text-text-primary font-semibold' : 'text-text-muted'}`}>Configure Terms</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Loan Type */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loanTypes.map((loanType) => {
            const typeId = loanType.loanTypeId || loanType.id || 1;
            const isSelected = selectedLoanType && (selectedLoanType.loanTypeId === typeId || selectedLoanType.id === typeId);
            return (
              <Card 
                key={typeId}
                className={`p-5 cursor-pointer border-border bg-white rounded space-y-3 ${
                  isSelected ? 'border-primary-600 bg-surface-sunken' : ''
                }`}
                onClick={() => handleLoanTypeSelect(loanType)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-text-primary">{loanType.loanName}</h3>
                  <Badge variant="outline">{loanType.category === 'SECURED' ? 'Secured' : 'Unsecured'}</Badge>
                </div>
                <p className="text-text-secondary text-xs min-h-[2.5rem]">
                  {loanType.description || 'Standard financial loan product calibration specs.'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  <div>
                    <span className="text-text-muted">Interest Rate:</span>
                    <p className="font-bold text-text-primary">{rateRangeLabel(loanType)}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Max Tenure:</span>
                    <p className="font-bold text-text-primary">{loanType.maxTenureMonths} Months</p>
                  </div>
                  {amountRangeLabel(loanType) && (
                    <div className="col-span-2">
                      <span className="text-text-muted">Eligible Amount:</span>
                      <p className="font-bold text-text-primary">{amountRangeLabel(loanType)}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Step 2: Loan Amount & Tenure Form */}
      {step === 2 && selectedLoanType && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border-border bg-white rounded space-y-4">
            
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={ArrowLeft}>
                Back
              </Button>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{selectedLoanType.loanName}</h2>
                <p className="text-xs text-text-secondary">
                  Category: {selectedLoanType.category === 'SECURED' ? 'Secured' : 'Unsecured'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('loanTypeId', { valueAsNumber: true })} />

              <Input
                label="Desired Loan Amount (₹)"
                type="number"
                placeholder="500000"
                {...register('loanAmount', { valueAsNumber: true })}
                error={errors.loanAmount?.message}
                helperText="Enter the total loan principal amount you wish to apply for"
              />

              <div className="space-y-2 bg-surface-sunken p-3 rounded border border-border">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-text-secondary">
                    Repayment Tenure (Months)
                  </label>
                  <span className="font-bold text-text-primary bg-ink-200 px-2 py-0.5 rounded">
                    {tenureMonthsValue} Months ({Math.round(tenureMonthsValue / 12 * 10) / 10} Yrs)
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedLoanType.minTenureMonths || 6}
                  max={selectedLoanType.maxTenureMonths || 360}
                  step="6"
                  className="w-full h-2 bg-ink-200 border border-border-strong rounded cursor-pointer accent-primary-600"
                  {...register('tenureMonths', { valueAsNumber: true })}
                />
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>{selectedLoanType.minTenureMonths || 6} Months Min</span>
                  <span>{selectedLoanType.maxTenureMonths || 360} Months Max</span>
                </div>
                {errors.tenureMonths && (
                  <p className="text-xs text-text-secondary mt-1">{errors.tenureMonths.message}</p>
                )}
              </div>

              <Input
                label="Expected Interest Rate (%)"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                {...register('interestRate', { valueAsNumber: true })}
                error={errors.interestRate?.message}
                helperText={`Standard benchmark rate for ${selectedLoanType.loanName} is ${rateRangeLabel(selectedLoanType)}`}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={Calculator}
                >
                  Run Calibration Assessment
                </Button>
              </div>
            </form>

          </Card>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit2,
  ChevronDown,
  ShieldCheck,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";
import { useGetLoanTypesQuery } from "@/services/loanTypeApi";
import {
  useCreateLoanTypeMutation,
  useUpdateLoanTypeMutation,
} from "@/services/adminApi";
import { loanTypeSchema } from "@/validators/admin.validators";
import { useToastContext } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageLoader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatPercent,
  formatCurrency,
  getErrorMessage,
} from "@/utils/helpers";
import { cn } from "@/utils/cn";

const CATEGORY_OPTIONS = [
  { value: "SECURED", label: "Secured (backed by collateral)" },
  { value: "UNSECURED", label: "Unsecured (no collateral)" },
];

// A brand-new loan type starts with sensible, editable defaults for the risk
// thresholds that drive the assessment engine's FOIR/DTI scoring — the
// backend doesn't guarantee its own defaults, so we provide real starting
// values rather than leaving these null until an admin thinks to fill them in.
const NEW_LOAN_DEFAULTS = {
  loanName: "",
  category: "SECURED",
  interestRate: 8.5,
  maxTenureMonths: 60,
  isActive: true,
  minInterestRate: "",
  maxInterestRate: "",
  minLoanAmount: "",
  maxLoanAmount: "",
  minTenureMonths: "",
  description: "",
  foirExcellentMax: 45,
  foirAcceptableMax: 60,
  foirCautionMax: 70,
  dtiLowMax: 35,
  dtiModerateMax: 50,
  dtiHighMax: 60,
  multiplier: 55,
};

const RISK_FIELDS = [
  "foirExcellentMax",
  "foirAcceptableMax",
  "foirCautionMax",
  "dtiLowMax",
  "dtiModerateMax",
  "dtiHighMax",
  "multiplier",
];

function rateRangeLabel(loan) {
  if (loan.minInterestRate != null && loan.maxInterestRate != null) {
    return `${formatPercent(loan.minInterestRate)} – ${formatPercent(loan.maxInterestRate)}`;
  }
  return formatPercent(loan.interestRate);
}

function amountRangeLabel(loan) {
  if (loan.minLoanAmount != null && loan.maxLoanAmount != null) {
    return `${formatCurrency(loan.minLoanAmount)} – ${formatCurrency(loan.maxLoanAmount)}`;
  }
  if (loan.maxLoanAmount != null)
    return `Up to ${formatCurrency(loan.maxLoanAmount)}`;
  return "Not configured";
}

export default function AdminLoanTypesPage() {
  const { data: loanTypesData = [], isLoading, error } = useGetLoanTypesQuery();
  const [createLoanType, { isLoading: isCreating }] =
    useCreateLoanTypeMutation();
  const [updateLoanType, { isLoading: isUpdating }] =
    useUpdateLoanTypeMutation();
  const toast = useToastContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);


  const loanTypes = Array.isArray(loanTypesData) ? loanTypesData : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loanTypeSchema),
    defaultValues: NEW_LOAN_DEFAULTS,
  });

  const hasAdvancedErrors = RISK_FIELDS.some((f) => errors[f]);
  useEffect(() => {
    if (hasAdvancedErrors) setIsAdvancedOpen(true);
  }, [hasAdvancedErrors]);

  const handleOpenModal = (loan = null) => {
    setEditingLoan(loan);
    setIsAdvancedOpen(false);
    if (loan) {
      reset({
        loanName: loan.loanName || "",
        category: loan.category || "SECURED",
        interestRate: loan.interestRate ?? 8.5,
        maxTenureMonths: loan.maxTenureMonths ?? 60,
        isActive: loan.isActive ?? true,
        minInterestRate: loan.minInterestRate ?? "",
        maxInterestRate: loan.maxInterestRate ?? "",
        minLoanAmount: loan.minLoanAmount ?? "",
        maxLoanAmount: loan.maxLoanAmount ?? "",
        minTenureMonths: loan.minTenureMonths ?? "",
        description: loan.description || "",
        foirExcellentMax: loan.foirExcellentMax ?? "",
        foirAcceptableMax: loan.foirAcceptableMax ?? "",
        foirCautionMax: loan.foirCautionMax ?? "",
        dtiLowMax: loan.dtiLowMax ?? "",
        dtiModerateMax: loan.dtiModerateMax ?? "",
        dtiHighMax: loan.dtiHighMax ?? "",
        multiplier: loan.multiplier ?? "",
      });
    } else {
      reset(NEW_LOAN_DEFAULTS);
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingLoan) {
        const typeId = editingLoan.loanTypeId || editingLoan.id;
        await updateLoanType({ id: typeId, ...data }).unwrap();
        console.log(data);
        toast.success("Loan type product updated successfully!");
      } else {
        await createLoanType(data).unwrap();
        toast.success("New loan type product created successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;
  if (error) {
    return (
      <EmptyState
        icon={Wallet}
        title="Failed to load loan products"
        description="There was an issue retrieving the loan products catalog. Please refresh."
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Lending Engine"
        title="Loan Products & Base Rates Catalog"
        description="Configure lending categories, benchmark rates, eligibility bounds, and the FOIR/DTI thresholds that drive assessment scoring."
        actions={
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            rightIcon={Plus}
          >
            Create Loan Product
          </Button>
        }
      />

      {loanTypes.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No loan products configured yet"
          description="Click 'Create Loan Product' to add your first lending benchmark."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loanTypes.map((loan) => {
            const typeId = loan.loanTypeId || loan.id;
            return (
              <Card
                key={typeId}
                className="p-6 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">
                        {loan.category === "SECURED" ? "Secured" : "Unsecured"}
                      </Badge>
                      <Badge
                        variant={
                          loan.isActive === false ? "default" : "success"
                        }
                      >
                        {loan.isActive === false ? "Inactive" : "Active"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(loan)}
                      leftIcon={Edit2}
                    >
                      Edit
                    </Button>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary">
                    {loan.loanName}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed min-h-[2.5rem]">
                    {loan.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border text-xs">
                  <div>
                    <span className="text-text-muted uppercase">
                      Interest Rate
                    </span>
                    <p className="text-sm font-bold font-mono text-text-primary">
                      {rateRangeLabel(loan)}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted uppercase">
                      Max Tenure
                    </span>
                    <p className="text-sm font-bold font-mono text-text-primary">
                      {loan.maxTenureMonths} Months
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted uppercase">
                      Loan Amount Range
                    </span>
                    <p className="text-sm font-bold font-mono text-text-primary">
                      {amountRangeLabel(loan)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Loan Type Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLoan ? "Edit Loan Product" : "Create New Loan Product"}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <Wallet size={16} />
              <h3 className="text-sm font-bold">Basic Info</h3>
            </div>

            <Input
              label="Loan Product Name"
              {...register("loanName")}
              error={errors.loanName?.message}
              placeholder="e.g., Prime Home Purchase Loan"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={CATEGORY_OPTIONS}
                {...register("category")}
                error={errors.category?.message}
              />
              <div className="flex items-end pb-2.5">
                <Switch
                  label="Active"
                  description="Visible to borrowers"
                  {...register("isActive")}
                />
              </div>
            </div>

            <Textarea
              label="Description (Optional)"
              rows={3}
              {...register("description")}
              error={errors.description?.message}
              placeholder="Brief description of eligibility criteria and benchmark targets..."
            />
          </div>

          {/* Section 2: Rate & Amount Limits */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border text-text-primary">
              <SlidersHorizontal size={16} />
              <h3 className="text-sm font-bold">Rate & Amount Limits</h3>
            </div>

            <Input
              label="Base Interest Rate (%)"
              type="number"
              step="0.1"
              {...register("interestRate")}
              error={errors.interestRate?.message}
              helperText="The default rate used in assessment calculations"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Interest Rate (%, optional)"
                type="number"
                step="0.1"
                {...register("minInterestRate")}
                error={errors.minInterestRate?.message}
              />
              <Input
                label="Max Interest Rate (%, optional)"
                type="number"
                step="0.1"
                {...register("maxInterestRate")}
                error={errors.maxInterestRate?.message}
                helperText="Rate range shown to borrowers"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Loan Amount (₹, optional)"
                type="number"
                {...register("minLoanAmount")}
                error={errors.minLoanAmount?.message}
              />
              <Input
                label="Max Loan Amount (₹, optional)"
                type="number"
                {...register("maxLoanAmount")}
                error={errors.maxLoanAmount?.message}
                helperText="Eligibility bounds for this product"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Tenure (Months, optional)"
                type="number"
                {...register("minTenureMonths")}
                error={errors.minTenureMonths?.message}
              />
              <Input
                label="Max Tenure (Months)"
                type="number"
                {...register("maxTenureMonths")}
                error={errors.maxTenureMonths?.message}
              />
            </div>
          </div>

          {/* Section 3: Risk Thresholds (collapsible) */}
          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <ShieldCheck size={16} />
                Risk Thresholds
                <span className="text-xs font-normal text-text-muted">
                  (advanced — drives assessment scoring)
                </span>
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-text-muted transition-transform",
                  isAdvancedOpen && "rotate-180",
                )}
              />
            </button>

            {isAdvancedOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Thresholds the assessment engine uses to classify a borrower's
                  FOIR and DTI. Each ladder should ascend left to right — leave
                  blank to fall back to the platform default.
                </p>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    FOIR Thresholds (%)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Excellent ≤"
                      type="number"
                      step="0.1"
                      {...register("foirExcellentMax")}
                      error={errors.foirExcellentMax?.message}
                    />
                    <Input
                      label="Acceptable ≤"
                      type="number"
                      step="0.1"
                      {...register("foirAcceptableMax")}
                      error={errors.foirAcceptableMax?.message}
                    />
                    <Input
                      label="Caution ≤"
                      type="number"
                      step="0.1"
                      {...register("foirCautionMax")}
                      error={errors.foirCautionMax?.message}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-text-muted">
                    DTI Thresholds (%)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Low ≤"
                      type="number"
                      step="0.1"
                      {...register("dtiLowMax")}
                      error={errors.dtiLowMax?.message}
                    />
                    <Input
                      label="Moderate ≤"
                      type="number"
                      step="0.1"
                      {...register("dtiModerateMax")}
                      error={errors.dtiModerateMax?.message}
                    />
                    <Input
                      label="High ≤"
                      type="number"
                      step="0.1"
                      {...register("dtiHighMax")}
                      error={errors.dtiHighMax?.message}
                    />
                  </div>
                </div>

                <Input
                  label="Eligible Amount Multiplier"
                  type="number"
                  step="0.1"
                  {...register("multiplier")}
                  error={errors.multiplier?.message}
                  helperText="e.g. 55 = 55× monthly income used to compute the max eligible amount"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingLoan ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

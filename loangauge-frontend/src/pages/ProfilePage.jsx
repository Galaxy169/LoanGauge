import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { profileSchema } from "../validators/profileValidators";
import {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from "../services/profileService";

// TODO: Confirm this matches your actual auth slice shape. Assumed
// state.auth.user.id based on authSlice/setCredentials conventions.
// If your auth state stores the user object differently, update this
// one line only.
export default function ProfilePage() {
  const userId = useSelector((state) => state.auth.user?.id);

  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
  } = useGetProfileQuery(userId, { skip: !userId });

  const existingProfile = profileResponse?.data;
  const profileNotFound = isProfileError && profileError?.status === 404;

  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  // Pre-fill the form once an existing profile loads.
  useEffect(() => {
    if (existingProfile) {
      reset(existingProfile);
    }
  }, [existingProfile, reset]);

  const onSubmit = async (data) => {
    try {
      if (existingProfile) {
        await updateProfile({ userId, data }).unwrap();
        toast.success("Financial profile updated successfully");
      } else {
        await createProfile({ userId, data }).unwrap();
        toast.success("Financial profile created successfully");
      }
    } catch (err) {
      const message =
        err?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  if (!userId) {
    return <p className="text-center mt-8">Please log in to continue.</p>;
  }

  if (isLoadingProfile) {
    return <p className="text-center mt-8">Loading your profile...</p>;
  }

  if (isProfileError && !profileNotFound) {
    return (
      <p className="text-center mt-8 text-red-600">
        Failed to load profile. Please try again later.
      </p>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {existingProfile ? "Update Your Financial Profile" : "Create Your Financial Profile"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Age" error={errors.age}>
          <input
            type="number"
            {...register("age", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Marital Status" error={errors.maritalStatus}>
          <input type="text" {...register("maritalStatus")} className="input" />
        </Field>

        <Field label="Number of Dependents" error={errors.dependents}>
          <input
            type="number"
            {...register("dependents", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="City Type" error={errors.cityType}>
          <input type="text" {...register("cityType")} className="input" />
        </Field>

        <Field label="Employment Type" error={errors.employmentType}>
          <input type="text" {...register("employmentType")} className="input" />
        </Field>

        <Field label="Work Experience (years)" error={errors.workExperienceYears}>
          <input
            type="number"
            {...register("workExperienceYears", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Income Stability" error={errors.incomeStability}>
          <input type="text" {...register("incomeStability")} className="input" />
        </Field>

        <Field label="Monthly Income" error={errors.monthlyIncome}>
          <input
            type="number"
            step="0.01"
            {...register("monthlyIncome", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Monthly Expenses" error={errors.monthlyExpenses}>
          <input
            type="number"
            step="0.01"
            {...register("monthlyExpenses", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Existing Loans (count)" error={errors.existingLoans}>
          <input
            type="number"
            {...register("existingLoans", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Monthly EMI" error={errors.monthlyEmi}>
          <input
            type="number"
            step="0.01"
            {...register("monthlyEmi", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Credit Card Balance" error={errors.creditCardBalance}>
          <input
            type="number"
            step="0.01"
            {...register("creditCardBalance", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Savings" error={errors.savings}>
          <input
            type="number"
            step="0.01"
            {...register("savings", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Fixed Deposits (optional)" error={errors.fixedDeposits}>
          <input
            type="number"
            step="0.01"
            {...register("fixedDeposits", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Investments (optional)" error={errors.investments}>
          <input
            type="number"
            step="0.01"
            {...register("investments", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Emergency Fund" error={errors.emergencyFund}>
          <input
            type="number"
            step="0.01"
            {...register("emergencyFund", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="CIBIL Score" error={errors.cibilScore}>
          <input
            type="number"
            {...register("cibilScore", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Credit Utilization (%)" error={errors.creditUtilization}>
          <input
            type="number"
            step="0.01"
            {...register("creditUtilization", { valueAsNumber: true })}
            className="input"
          />
        </Field>

        <Field label="Notes (optional)" error={errors.notes}>
          <textarea {...register("notes")} className="input" rows={3} />
        </Field>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
        >
          {isSaving ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

import { useAssessmentForm } from "../../hooks/useAssessmentForm";

export default function AssessmentFormPage() {
  const { form, loanTypes, loadingLoanTypes, submitting, onSubmit } =
    useAssessmentForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">
          New Assessment
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your loan details to check your financial readiness.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Loan type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loan Type
            </label>
            <select
              {...register("loanTypeId")}
              disabled={loadingLoanTypes}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            >
              <option value="">Select a loan type…</option>
              {loanTypes.map((lt) => (
                <option key={lt.loanTypeId} value={lt.loanTypeId}>
                  {lt.loanName} ({lt.interestRate}% up to {lt.maxTenureMonths}{" "}
                  mo)
                </option>
              ))}
            </select>
            {errors.loanTypeId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.loanTypeId.message}
              </p>
            )}
          </div>

          {/* Loan amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("loanAmount")}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="e.g. 3000000"
            />
            {errors.loanAmount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.loanAmount.message}
              </p>
            )}
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tenure (months)
            </label>
            <input
              type="number"
              {...register("tenureMonths")}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="e.g. 240"
            />
            {errors.tenureMonths && (
              <p className="text-xs text-red-500 mt-1">
                {errors.tenureMonths.message}
              </p>
            )}
          </div>

          {/* Interest rate */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("interestRate")}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="e.g. 8.5"
            />
            {errors.interestRate && (
              <p className="text-xs text-red-500 mt-1">
                {errors.interestRate.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-medium"
          >
            {submitting ? "Calculating…" : "Run Assessment"}
          </button>
        </form>
      </div>
    </div>
  );
}

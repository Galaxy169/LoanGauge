import { useLocation, useNavigate } from "react-router-dom";
import ScoreGauge from "../../components/charts/ScoreGauge";

const RISK_LABELS = {
  EXCELLENT: { text: "Excellent", cls: "bg-green-100 text-green-700" },
  GOOD: { text: "Good", cls: "bg-lime-100 text-lime-700" },
  MODERATE: { text: "Moderate", cls: "bg-amber-100 text-amber-700" },
  NEEDS_IMPROVEMENT: {
    text: "Needs Improvement",
    cls: "bg-orange-100 text-orange-700",
  },
  HIGH_RISK: { text: "High Risk", cls: "bg-red-100 text-red-700" },
};

const inr = (n) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);

function Metric({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}

export default function AssessmentResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const a = state?.assessment;

  if (!a) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <p className="text-slate-600">No assessment to display.</p>
        <button
          onClick={() => navigate("/assessment")}
          className="text-brand-600 underline"
        >
          Run a new assessment
        </button>
      </div>
    );
  }

  const risk = RISK_LABELS[a.riskLevel] ?? {
    text: a.riskLevel,
    cls: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <h1 className="text-lg font-semibold text-slate-700 mb-4">
            Financial Readiness Score
          </h1>
          <ScoreGauge score={a.financialScore} />
          <span
            className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${risk.cls}`}
          >
            {risk.text}
          </span>
        </div>

        {/* Eligible amount highlight */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-slate-500">You requested</div>
          <div className="text-xl font-semibold text-slate-800">
            {inr(a.loanAmount)}
          </div>
          <div className="text-sm text-slate-500 mt-3">
            Estimated amount you're eligible for
          </div>
          <div className="text-2xl font-bold text-brand-600">
            {inr(a.eligibleAmount)}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Monthly EMI" value={inr(a.emi)} />
            <Metric label="FOIR" value={`${a.foir}%`} />
            <Metric label="DTI" value={`${a.dti}%`} />
            <Metric label="Savings Ratio" value={`${a.savingsRatio}%`} />
            <Metric
              label="Emergency Fund"
              value={`${a.emergencyFundCoverageMonths} mo`}
            />
            <Metric
              label="Credit Utilization"
              value={`${a.creditUtilization}%`}
            />
            <Metric label="Disposable Income" value={inr(a.disposableIncome)} />
            <Metric label="Loan Type" value={a.loanTypeName} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/assessment")}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 font-medium"
          >
            New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

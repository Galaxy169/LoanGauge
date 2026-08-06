import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Scale,
  Wallet,
  PieChart,
  TrendingDown,
  PiggyBank,
  ShieldAlert,
  DollarSign,
  Sparkles,
  Download,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Gauge } from "@/components/ui/Gauge";
import { PageLoader } from "@/components/ui/Loader";
import { useToastContext } from "@/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { useGetAssessmentQuery } from "@/services/assessmentApi";
import { useCreateConsultationMutation } from "@/services/consultationApi";
import { useGetRecommendationsQuery } from "@/services/recommendationApi";
import { useEmailReportMutation } from "@/services/notificationApi";
import { API_BASE_URL } from "@/services/api";
import { selectAccessToken } from "@/store/authSlice";
import {
  formatCurrency,
  formatPercent,
  formatDate,
  getErrorMessage,
} from "@/utils/helpers";

// Recommendations are generated asynchronously via RabbitMQ after the
// assessment is created — poll until they show up, but don't poll forever.
const RECOMMENDATIONS_POLL_INTERVAL_MS = 1500;
const RECOMMENDATIONS_TIMEOUT_MS = 20000;

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const toast = useToastContext();

  const { data: assessmentData, isLoading, error } = useGetAssessmentQuery(id);
  const [createConsultation, { isLoading: isRequesting }] =
    useCreateConsultationMutation();
  const [emailReport, { isLoading: isEmailing }] = useEmailReportMutation();
  const accessToken = useSelector(selectAccessToken);
  const [isDownloading, setIsDownloading] = useState(false);

  const assessment = assessmentData?.data || assessmentData;

  const [hasTimedOut, setHasTimedOut] = useState(false);
  // Polling interval is plain state (not derived inline from this hook's own
  // return value — that would be a circular reference within the same const
  // declaration). It starts at the poll rate and gets flipped to 0 by the
  // effects below once we have data or give up.
  const [pollInterval, setPollInterval] = useState(
    RECOMMENDATIONS_POLL_INTERVAL_MS,
  );

  // AI Recommendations is a premium feature — the backend now verifies the
  // token's role and returns 403 for free users, so there's no point
  // polling an endpoint we already know will be rejected. assessmentId is
  // stored as a string in MongoDB — `id` from useParams() is already a
  // string, so it's passed through as-is (no Number() coercion).
  const { data: recommendation } = useGetRecommendationsQuery(id, {
    skip: !isPremium || isLoading || !assessment,
    // A 404 here is expected/normal ("not generated yet"), never a hard error.
    pollingInterval: pollInterval,
  });

  // Stop polling once recommendations arrive.
  useEffect(() => {
    if (recommendation) setPollInterval(0);
  }, [recommendation]);

  // Give up after RECOMMENDATIONS_TIMEOUT_MS if nothing has arrived yet.
  // Skipped for free users too — there's nothing to wait for since the
  // query above never even runs for them.
  useEffect(() => {
    if (!isPremium || isLoading || !assessment || recommendation || hasTimedOut)
      return;
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      setPollInterval(0);
    }, RECOMMENDATIONS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isPremium, isLoading, assessment, recommendation, hasTimedOut]);

  const handleRequestConsultation = async () => {
    try {
      await createConsultation({ assessmentId: Number(id) }).unwrap();
      toast.success("Consultation requested successfully!");
      navigate("/consultations");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Binary response — this goes through a raw fetch (not RTK Query) so we
  // can read it as a blob, with the Bearer token attached by hand since
  // there's no fetchBaseQuery `prepareHeaders` involved here.
  const handleDownloadReport = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/${id}/download`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        let message = "Failed to download report";
        try {
          const body = await response.clone().json();
          message = body?.message || message;
        } catch {
          // Response wasn't JSON (e.g. plain text/HTML from the gateway) —
          // fall back to the status text.
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessment-${id}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      const result = await emailReport(id).unwrap();
      toast.success(result?.message || "Report emailed successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;

  if (error || !assessment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 font-sans text-text-primary">
        <h2 className="text-xl font-bold text-text-primary">
          Assessment Not Found
        </h2>
        <p className="text-text-secondary text-sm">
          Could not load the requested calibration details.
        </p>
        <Button onClick={() => navigate("/assessments")} variant="primary">
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/assessments"
            className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
              Calibration Report
            </span>
            <h1 className="text-2xl font-bold text-text-primary">
              Assessment Results #{assessment.id || id}
            </h1>
            <p className="text-xs text-text-muted">
              {formatDate(assessment.assessmentDate)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            isLoading={isDownloading}
            disabled={isDownloading}
            leftIcon={Download}
          >
            Download PDF Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailReport}
            isLoading={isEmailing}
            disabled={isEmailing}
            leftIcon={Mail}
          >
            Email Me Report
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/assessments/compare")}
            leftIcon={Scale}
          >
            Compare Assessments
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/assessments/new")}
            leftIcon={Plus}
          >
            New Assessment
          </Button>
        </div>
      </div>

      {/* Hero Score Card */}
      <Card className="p-6 bg-white border-border rounded">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <Badge variant={assessment.riskLevel} className="mb-2">
                {assessment.riskLevel?.replace("_", " ")}
              </Badge>
              <h2 className="text-2xl font-bold text-text-primary">
                {assessment.loanTypeName ||
                  assessment.loanType?.name ||
                  "Loan Assessment"}
              </h2>
              <div className="flex flex-wrap gap-3 text-xs text-text-secondary mt-2">
                <span>
                  Amount:{" "}
                  <strong className="text-text-primary">
                    {formatCurrency(assessment.loanAmount)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Tenure:{" "}
                  <strong className="text-text-primary">
                    {assessment.tenureMonths} Months
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Rate:{" "}
                  <strong className="text-text-primary">
                    {assessment.interestRate}%
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {isPremium ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestConsultation}
                  isLoading={isRequesting}
                  leftIcon={MessageSquare}
                >
                  Request Advisor Review
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/upgrade")}
                  leftIcon={ShieldAlert}
                >
                  Upgrade for 1-on-1 Advisor Review
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-surface-sunken rounded border border-border">
            <Gauge
              value={assessment.financialScore}
              size="lg"
              riskLevel={assessment.riskLevel}
              label="READINESS SCORE"
            />
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6 bg-white border-border rounded space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h3 className="text-lg font-bold text-text-primary">
              AI Recommendations
            </h3>
          </div>
          {isPremium && recommendation && (
            <Badge
              variant={
                recommendation.source === "GEMINI" ? "primary" : "outline"
              }
            >
              {recommendation.source === "GEMINI" ? "GEMINI" : "AI Fallback"}
            </Badge>
          )}
        </div>

        {!isPremium && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-surface-sunken rounded border border-border">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-text-muted shrink-0" />
              <p className="text-sm text-text-secondary">
                AI-powered recommendations are a premium feature. Upgrade to get
                personalized tips for this assessment.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/upgrade")}
              leftIcon={ShieldAlert}
              className="shrink-0"
            >
              Upgrade to Unlock
            </Button>
          </div>
        )}

        {isPremium && !recommendation && !hasTimedOut && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-surface-hover rounded w-5/6" />
            <div className="h-3 bg-surface-hover rounded w-4/6" />
            <div className="h-3 bg-surface-hover rounded w-3/6" />
            <p className="text-xs text-text-muted pt-1">
              Generating personalized recommendations…
            </p>
          </div>
        )}

        {isPremium && !recommendation && hasTimedOut && (
          <p className="text-sm text-text-secondary">
            Recommendations are being generated. Refresh the page in a few
            seconds.
          </p>
        )}

        {isPremium &&
          recommendation &&
          (recommendation.recommendations?.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside">
              {recommendation.recommendations.map((tip, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              No recommendations available for this assessment.
            </p>
          ))}
      </Card>

      {/* Financial Metrics Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">
          Quantitative Risk Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-border rounded space-y-1">
            <div className="flex justify-between items-center text-text-muted">
              <Wallet className="w-4 h-4 text-text-secondary" />
              <span className="text-[10px] uppercase font-semibold">
                Monthly
              </span>
            </div>
            <p className="text-xs uppercase text-text-muted">Estimated EMI</p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(assessment.emi)}
            </p>
          </Card>

          <Card className="p-4 bg-white border-border rounded space-y-1">
            <div className="flex justify-between items-center text-text-muted">
              <PieChart className="w-4 h-4 text-text-secondary" />
              <span className="text-[10px] uppercase font-semibold">
                FOIR Ratio
              </span>
            </div>
            <p className="text-xs uppercase text-text-muted">
              Fixed Obligations (FOIR)
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatPercent(assessment.foir)}
            </p>
          </Card>

          <Card className="p-4 bg-white border-border rounded space-y-1">
            <div className="flex justify-between items-center text-text-muted">
              <TrendingDown className="w-4 h-4 text-text-secondary" />
              <span className="text-[10px] uppercase font-semibold">
                DTI Ratio
              </span>
            </div>
            <p className="text-xs uppercase text-text-muted">
              Debt-to-Income (DTI)
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatPercent(assessment.dti)}
            </p>
          </Card>

          <Card className="p-4 bg-white border-border rounded space-y-1">
            <div className="flex justify-between items-center text-text-muted">
              <PiggyBank className="w-4 h-4 text-text-secondary" />
              <span className="text-[10px] uppercase font-semibold">
                Savings Ratio
              </span>
            </div>
            <p className="text-xs uppercase text-text-muted">
              Net Savings Capacity
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatPercent(assessment.savingsRatio)}
            </p>
          </Card>

          <Card className="p-4 bg-white border-border rounded space-y-1">
            <div className="flex justify-between items-center text-text-muted">
              <ShieldAlert className="w-4 h-4 text-text-secondary" />
              <span className="text-[10px] uppercase font-semibold">
                Liquidity
              </span>
            </div>
            <p className="text-xs uppercase text-text-muted">
              Emergency Fund Coverage
            </p>
            <p className="text-xl font-bold text-text-primary">
              {assessment.emergencyFundCoverageMonths} Months
            </p>
          </Card>

          <Card className="p-4 bg-surface-hover border border-border rounded space-y-1 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center text-text-secondary">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold">
                Borrowing Limit
              </span>
            </div>
            <p className="text-xs uppercase text-text-secondary font-bold">
              Max Eligible Amount
            </p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(assessment.eligibleAmount)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge } from '@/components/ui/Gauge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoader } from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useCheckProfileExistsQuery } from '@/services/financialProfileApi';
import { useGetAssessmentHistoryQuery } from '@/services/assessmentApi';
import { useGetGoalsQuery } from '@/services/goalApi';
import { formatCurrency, formatPercent, formatDate, getRiskLabel } from '@/utils/helpers';
import {
  Plus,
  Target,
  History,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

/** Lightweight rule-based tips derived from the latest assessment (mirrors the
 *  backend's rule-based recommender fallback) — no extra API calls required. */
function buildRecommendations(assessment) {
  if (!assessment) return [];
  const tips = [];

  if ((assessment.foir ?? 0) > 50) {
    tips.push('Your FOIR is above 50% — pay down an existing EMI before applying for a new loan to improve approval odds.');
  }
  if ((assessment.dti ?? 0) > 40) {
    tips.push('Debt-to-income is on the higher side. Reducing revolving debt (credit cards) will raise your eligible amount.');
  }
  if ((assessment.emergencyFundCoverageMonths ?? 99) < 3) {
    tips.push('Build your emergency fund to at least 3 months of expenses — lenders weigh liquidity buffers favorably.');
  }
  if (tips.length === 0) {
    tips.push('Your financial profile is well balanced. Maintain your current savings rate to keep your score strong.');
  }
  return tips.slice(0, 3);
}

export default function DashboardPage() {
  const { user, isUser, isPremium } = useAuth();

  const { data: profileExists, isLoading: isProfileLoading } = useCheckProfileExistsQuery();
  const { data: assessmentsData = [], isLoading: isAssessmentsLoading } = useGetAssessmentHistoryQuery();
  const { data: goalsData = [], isLoading: isGoalsLoading } = useGetGoalsQuery();

  const assessments = Array.isArray(assessmentsData) ? assessmentsData : [];
  const goals = Array.isArray(goalsData) ? goalsData : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const latestAssessment = assessments.length > 0 ? assessments[0] : null;
  const recentAssessments = assessments.slice(0, 3);
  const topGoals = goals.slice(0, 3);
  const recommendations = buildRecommendations(latestAssessment);

  if (isProfileLoading || isAssessmentsLoading || isGoalsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Executive Dashboard"
        title={`Good ${getGreeting()}, ${user?.firstName || 'there'}`}
        description={formatDate(new Date())}
        actions={
          <>
            <Link to="/goals/new">
              <Button variant="outline" size="md" leftIcon={Target}>Set Financial Goal</Button>
            </Link>
            <Link to="/assessments/new">
              <Button variant="primary" size="md" leftIcon={Plus}>New Assessment</Button>
            </Link>
          </>
        }
      />

      {/* Upgrade banner for free users */}
      {isUser && !isPremium && (
        <Card className="p-5 bg-primary-50 border-primary-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="primary">Premium Tier</Badge>
              <h3 className="text-base font-bold text-text-primary">Unlock unlimited calibrations & advisor access</h3>
              <p className="text-text-secondary text-xs max-w-xl">
                Get unlimited loan assessments, side-by-side comparison trends, and 1-on-1 advisor consultation reviews.
              </p>
            </div>
            <Link to="/upgrade" className="shrink-0">
              <Button variant="primary" size="md" rightIcon={ArrowRight}>Upgrade Now (₹999)</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Missing profile prompt */}
      {!profileExists && (
        <Card className="p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 mx-auto">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-base font-bold text-text-primary">Complete Your Financial Profile</h2>
          <p className="text-text-secondary text-xs max-w-lg mx-auto">
            We need basic information on your monthly income, living expenses, existing debt, and credit score to run accurate readiness calibrations.
          </p>
          <Link to="/financial-profile" className="inline-block pt-1">
            <Button variant="primary" size="md">Create Profile Now</Button>
          </Link>
        </Card>
      )}

      {/* Financial Score + Financial Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col items-center justify-between p-6">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wide text-text-muted font-semibold">Financial Score</span>
              {latestAssessment && <Badge variant={latestAssessment.riskLevel}>{getRiskLabel(latestAssessment.riskLevel)}</Badge>}
            </div>

            <div className="py-3">
              <Gauge
                value={latestAssessment?.financialScore || 0}
                size="lg"
                label={latestAssessment ? undefined : 'No assessments yet'}
                riskLevel={latestAssessment?.riskLevel}
              />
            </div>

            {latestAssessment ? (
              <div className="w-full pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Evaluated {formatDate(latestAssessment.assessmentDate)}</span>
                <Link to={`/assessments/${latestAssessment.id || latestAssessment.assessmentId}`} className="text-primary-600 font-semibold hover:text-primary-700">
                  View report →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center pt-2">Run your first assessment to unlock your score.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="h-full p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-[11px] uppercase tracking-wide text-text-muted font-semibold">Financial Health</span>
              {latestAssessment && (
                <span className="text-xs text-text-secondary font-semibold">{latestAssessment.loanTypeName || 'Loan Product'}</span>
              )}
            </div>

            {latestAssessment ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-sunken space-y-0.5">
                  <span className="text-[11px] uppercase text-text-muted">Estimated EMI</span>
                  <p className="text-lg font-bold font-mono text-text-primary">{formatCurrency(latestAssessment.emi)}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-sunken space-y-0.5">
                  <span className="text-[11px] uppercase text-text-muted">FOIR</span>
                  <p className="text-lg font-bold font-mono text-text-primary">{formatPercent(latestAssessment.foir)}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-sunken space-y-0.5">
                  <span className="text-[11px] uppercase text-text-muted">Debt-to-Income</span>
                  <p className="text-lg font-bold font-mono text-text-primary">{formatPercent(latestAssessment.dti)}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-50 space-y-0.5">
                  <span className="text-[11px] uppercase text-primary-700 font-semibold">Max Eligible Amount</span>
                  <p className="text-lg font-bold font-mono text-primary-800">{formatCurrency(latestAssessment.eligibleAmount)}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted space-y-2 bg-surface-sunken rounded-lg">
                <TrendingUp size={22} className="mx-auto" />
                <p className="text-xs font-medium">Run your first assessment to unlock your loan metrics here.</p>
                <Link to="/assessments/new" className="inline-block">
                  <Button variant="outline" size="sm">Start Assessment</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      {latestAssessment && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-primary-600" />
            <h3 className="text-sm font-bold text-text-primary">Recommendations</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendations.map((tip, idx) => (
              <li key={idx} className="flex gap-2 rounded-lg bg-surface-sunken p-3 text-xs text-text-secondary leading-relaxed">
                <Sparkles size={14} className="text-primary-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recent Assessments & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Recent Assessments</h3>
            <Link to="/assessments" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View history <ArrowRight size={13} />
            </Link>
          </div>

          {recentAssessments.length > 0 ? (
            <div className="space-y-2">
              {recentAssessments.map((assessment) => (
                <Link key={assessment.id || assessment.assessmentId} to={`/assessments/${assessment.id || assessment.assessmentId}`} className="block">
                  <Card className="p-3 flex items-center justify-between" interactive>
                    <div className="flex items-center gap-3">
                      <Gauge value={assessment.financialScore} size="sm" riskLevel={assessment.riskLevel} showLabel={false} />
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">{assessment.loanTypeName || 'Loan Assessment'}</h4>
                        <p className="text-xs text-text-muted">{formatDate(assessment.assessmentDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-text-secondary hidden sm:block">
                        {formatCurrency(assessment.loanAmount)}
                      </p>
                      <Badge variant={assessment.riskLevel}>{getRiskLabel(assessment.riskLevel)}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={History} title="No assessments yet" description="Run your first calibration to see it here." />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Active Financial Goals</h3>
            <Link to="/goals" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View goals <ArrowRight size={13} />
            </Link>
          </div>

          {topGoals.length > 0 ? (
            <div className="space-y-2">
              {topGoals.map((goal) => (
                <Link key={goal.goalId || goal.id} to={`/goals/${goal.goalId || goal.id}`} className="block">
                  <Card className="p-3 space-y-2" interactive>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-text-primary text-sm">{goal.goalName}</h4>
                      <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                        {goal.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-ink-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${goal.progressPercentage}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-text-secondary">
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      <span className="text-text-primary font-semibold">{formatCurrency(goal.requiredMonthlySavings)}/mo</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Target} title="No goals yet" description="Set a savings target to start tracking progress." />
          )}
        </div>
      </div>
    </div>
  );
}

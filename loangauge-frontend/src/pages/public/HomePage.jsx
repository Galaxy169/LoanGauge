import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  LineChart,
  BadgeCheck,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Gauge } from "@/components/ui/Gauge";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import { useLogoutMutation } from "@/services/authApi";
import { formatCurrency } from "@/utils/helpers";

function SimSlider({ label, value, onChange, min, max, step, formatValue }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text-secondary">{label}</span>
        <span className="font-mono font-semibold text-text-primary">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-ink-200 cursor-pointer"
      />
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  // Live Simulator state
  const [income, setIncome] = useState(120000);
  const [existingEmi, setExistingEmi] = useState(25000);
  const [loanAmount, setLoanAmount] = useState(1500000);

  // Live Math calculation for interactive landing widget
  const estimatedEmi = Math.round(
    (loanAmount * (0.095 / 12) * Math.pow(1 + 0.095 / 12, 60)) /
      (Math.pow(1 + 0.095 / 12, 60) - 1),
  );
  const totalObligation = existingEmi + estimatedEmi;
  const foirRatio = Math.min(Math.round((totalObligation / income) * 100), 100);
  const simScore = Math.max(
    15,
    Math.min(95, Math.round(100 - foirRatio * 0.8)),
  );

  const pillars = [
    {
      icon: Calculator,
      title: "Precision Calibration",
      description:
        "FOIR, DTI, and income-stability metrics computed with bank-grade accuracy.",
    },
    {
      icon: LineChart,
      title: "Track Your Progress",
      description:
        "Compare assessments over time and watch your readiness score improve.",
    },
    {
      icon: ShieldCheck,
      title: "Confidential & Secure",
      description:
        "Your financial data is encrypted and never sold to third-party brokers.",
    },
  ];

  const stats = [
    { label: "Assessments Calibrated", value: "50K+" },
    { label: "Avg. Score Improvement", value: "+18 pts" },
    { label: "Certified Advisors", value: "120+" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface-sunken">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-20">
          <div className="lg:col-span-6">
            {isAuthenticated ? (
              <>
                <h1 className="mt-4 text-3xl font-bold font-heading leading-tight text-text-primary sm:text-4xl lg:text-[2.75rem]">
                  Welcome back, {user?.firstName || "there"}.
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">
                  Pick up where you left off — check your latest readiness score
                  or run a new assessment.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/dashboard">
                    <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLogout}
                    leftIcon={LogOut}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-4 text-3xl font-bold font-heading leading-tight text-text-primary sm:text-4xl lg:text-[2.75rem]">
                  Know your loan eligibility before the bank does.
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">
                  LoanGauge calibrates your borrowing capacity using FOIR, DTI,
                  and credit-risk algorithms so you apply with confidence and
                  avoid rejections.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/register">
                    <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button variant="outline" size="lg">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] uppercase tracking-wide text-text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-lg font-bold font-heading text-text-primary">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Live Simulator */}
          <div className="lg:col-span-6">
            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Instant Readiness Simulator
                  </h2>
                  <p className="text-xs text-text-muted">
                    Adjust the sliders to see your live score
                  </p>
                </div>
                <Gauge value={simScore} size="md" showLabel={false} />
              </div>

              <div className="space-y-5 py-5">
                <SimSlider
                  label="Gross Monthly Income"
                  value={income}
                  onChange={setIncome}
                  min={30000}
                  max={500000}
                  step={5000}
                  formatValue={formatCurrency}
                />
                <SimSlider
                  label="Existing Monthly Debt (EMIs)"
                  value={existingEmi}
                  onChange={setExistingEmi}
                  min={0}
                  max={150000}
                  step={2500}
                  formatValue={formatCurrency}
                />
                <SimSlider
                  label="Desired Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  min={100000}
                  max={5000000}
                  step={50000}
                  formatValue={formatCurrency}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="rounded-lg bg-surface-sunken p-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-muted">
                    Estimated New EMI
                  </p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-text-primary">
                    {formatCurrency(estimatedEmi)}/mo
                  </p>
                </div>
                <div className="rounded-lg bg-surface-sunken p-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-muted">
                    FOIR Ratio
                  </p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-text-primary">
                    {foirRatio}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold font-heading text-text-primary">
            Built for confident borrowing
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Everything you need to understand and improve your loan eligibility
            before you apply.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-border bg-ink-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">
              {isAuthenticated
                ? "Ready for your next assessment?"
                : "Ready to calibrate your readiness?"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-300">
              {isAuthenticated
                ? `Run another calibration, ${user?.firstName || "friend"}, and track how your score changes over time.`
                : "Create a free account and run your first assessment in under two minutes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isAuthenticated && (
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                  Create Free Account
                </Button>
              </Link>
            )}
            <Link
              to="/assessments/new"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-ink-600 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800"
            >
              Run an Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

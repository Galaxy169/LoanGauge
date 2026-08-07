import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-text-primary">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text-primary">Privacy Policy</h1>
        <p className="text-xs text-text-muted">Last Updated: August 2026</p>
      </div>

      <Card className="p-6 border-border bg-white rounded space-y-4 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-1">
          <h2 className="text-base font-bold text-text-primary">1. Information We Collect</h2>
          <p>
            LoanGauge collects personal data necessary for calculating financial readiness metrics, including monthly income figures, living expenses, existing debt obligations, and credit score ranges.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-base font-bold text-text-primary">2. How Your Data Is Used</h2>
          <p>
            Data is strictly processed to execute mathematical calculations (FOIR, DTI, Max Borrowing Limits) and generate your assessment reports. We do not sell your data to third-party loan brokers or marketing lead aggregators.
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-base font-bold text-text-primary">3. Data Security & Encryption</h2>
          <p>
            All information is encrypted in transit via 256-bit SSL protocols and stored on secure cloud database servers with strict access controls.
          </p>
        </section>
      </Card>
    </div>
  );
}


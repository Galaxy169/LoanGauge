import React from 'react';
import { ShieldCheck, Target, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AboutPage() {
  const pillars = [
    {
      icon: Target,
      title: 'Precision Calibration',
      description: 'We believe financial readiness is a science, not a guess. Our algorithms evaluate exact DTI, FOIR, and income stability metrics.'
    },
    {
      icon: ShieldCheck,
      title: 'Confidential & Secure',
      description: 'Your financial data is protected by 256-bit encryption. We never share your records with third-party lead brokers.'
    },
    {
      icon: Award,
      title: 'Empowered Borrowers',
      description: 'We help borrowers identify and fix vulnerabilities in their financial profiles prior to bank application submission.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-text-primary">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <Badge variant="default">Our Mission</Badge>
        <h1 className="text-3xl font-bold text-text-primary">
          Calibrating the Future of Borrowing Confidence
        </h1>
        <p className="text-text-secondary text-sm">
          LoanGauge was built to eliminate loan application rejections by giving borrowers transparent, bank-grade readiness metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-6 border-border bg-white rounded space-y-3">
              <div className="w-10 h-10 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


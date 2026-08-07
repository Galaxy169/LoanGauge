import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Build Financial Profile',
      description: 'Input your monthly income, living expenses, existing debt obligations, and credit score range.'
    },
    {
      num: '02',
      title: 'Select Loan Product',
      description: 'Choose from Home, Personal, Education, or Business loans with standard benchmark interest rates.'
    },
    {
      num: '03',
      title: 'Calibrate Readiness Score',
      description: 'Our engine evaluates your FOIR, DTI, and max eligible borrowing limit with empirical accuracy.'
    },
    {
      num: '04',
      title: 'Execute Action Plan',
      description: 'Review personalized recommendations to improve your score or consult with a certified financial advisor.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-text-primary">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary">
          How LoanGauge Calibrates Your Eligibility
        </h1>
        <p className="text-text-secondary text-sm">
          Four simple steps to calculate your exact borrowing power before approaching lenders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <Card key={idx} className="p-6 border-border bg-white rounded space-y-2">
            <span className="text-2xl font-bold text-text-muted">{step.num}</span>
            <h3 className="text-lg font-bold text-text-primary">{step.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link to="/register">
          <Button variant="primary" size="lg" rightIcon={ArrowRight}>
            Start Your Free Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}


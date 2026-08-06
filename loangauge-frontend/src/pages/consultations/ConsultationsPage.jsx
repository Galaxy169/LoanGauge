import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGetConsultationsQuery } from '@/services/consultationApi';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/helpers';

export default function ConsultationsPage() {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  
  const { data: consultationsData = [], isLoading, error } = useGetConsultationsQuery(undefined, {
    skip: !isPremium
  });

  const consultations = Array.isArray(consultationsData) ? consultationsData : [];

  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 font-sans text-text-primary">
        <Card className="p-8 border-border bg-white rounded text-center space-y-4">
          <div className="w-12 h-12 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <Badge variant="default" className="mx-auto">Premium Feature</Badge>
          <h2 className="text-xl font-bold text-text-primary">1-on-1 Certified Advisor Consultations</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Advisor consultations are exclusively available on the Premium Plan. Upgrade to request personalized financial reviews directly from our experts.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/upgrade')}>
            Upgrade to Premium
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <EmptyState 
          icon={MessageSquare}
          title="Failed to load consultations"
          description="There was an issue retrieving your consultations. Please refresh or try again later."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 font-sans text-text-primary">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Financial Advisory Desk</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1">My Consultations</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Review personalized advice and recommendations from certified financial advisors.
          </p>
        </div>
      </div>

      {consultations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Consultations Requested Yet"
          description="You can request a consultation directly from any assessment detail report page."
          action={
            <Button variant="outline" size="md" onClick={() => navigate('/assessments')}>
              View Assessments History
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation, index) => (
            <Card key={consultation.id || consultation.consultationId || index} className="p-6 border-border bg-white rounded space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">Consultation #{consultation.id || consultation.consultationId}</h3>
                    {consultation.remarks ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1 inline" /> Responded
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1 inline" /> Pending Review
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Requested on {formatDate(consultation.createdAt)}
                  </p>
                </div>

                <Link 
                  to={`/assessments/${consultation.assessmentId}`}
                  className="text-xs font-bold text-text-primary hover:underline flex items-center gap-1"
                >
                  View Related Assessment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {consultation.remarks ? (
                <div className="bg-surface-sunken rounded p-4 border border-border space-y-1">
                  <span className="text-xs font-bold uppercase text-text-primary">Certified Advisor Remarks</span>
                  <p className="text-text-primary text-xs whitespace-pre-wrap leading-relaxed">
                    {consultation.remarks}
                  </p>
                  <p className="text-[11px] text-text-muted pt-2 border-t border-border">
                    Responded on {formatDate(consultation.updatedAt)}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-surface-sunken rounded border border-border border-dashed text-center space-y-1">
                  <Clock className="w-6 h-6 text-text-muted" />
                  <p className="text-xs font-semibold text-text-primary">Awaiting Advisor Review</p>
                  <p className="text-[11px] text-text-muted">Our financial advisors review metrics and respond within 24 business hours.</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


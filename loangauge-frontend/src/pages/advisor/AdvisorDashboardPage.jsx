import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Clock, CheckCircle, User, FileText, Send } from 'lucide-react';
import { useGetAdvisorConsultationsQuery, useRespondToConsultationMutation } from '@/services/consultationApi';
import { advisorRemarkSchema } from '@/validators/consultation.validators';
import { useToastContext } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate, getErrorMessage } from '@/utils/helpers';
import { Link } from 'react-router-dom';

export default function AdvisorDashboardPage() {
  const { data: consultationsData = [], isLoading, error } = useGetAdvisorConsultationsQuery();
  const [respondToConsultation] = useRespondToConsultationMutation();
  const toast = useToastContext();
  
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const consultations = Array.isArray(consultationsData) ? consultationsData : [];

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(advisorRemarkSchema)
  });

  const handleOpenModal = (consultation) => {
    setSelectedConsultation(consultation);
    reset({ remarks: '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const id = selectedConsultation.id || selectedConsultation.consultationId;
      await respondToConsultation({ 
        id, 
        remarks: data.remarks 
      }).unwrap();
      
      toast.success('Successfully recorded advisor consultation response!');
      setIsModalOpen(false);
      setSelectedConsultation(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <EmptyState 
          icon={MessageSquare}
          title="Failed to load advisor portal"
          description="There was an error loading active user consultation requests."
        />
      </div>
    );
  }

  // The backend's actual status value for a resolved consultation is
  // "COMPLETED", not the "RESPONDED" the docs describe — split on the
  // presence of remarks instead, which is reliable regardless of the
  // exact status string in use.
  const pendingConsultations = consultations.filter(c => !c.remarks);
  const respondedConsultations = consultations.filter(c => Boolean(c.remarks));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 font-sans text-text-primary">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Advisory Portal</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1 flex items-center gap-2">
            Financial Advisor Workspace
            {pendingConsultations.length > 0 && (
              <Badge variant="default">
                {pendingConsultations.length} Pending
              </Badge>
            )}
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Review user assessment metrics and issue certified advisory responses.
          </p>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-secondary" /> Pending Consultation Queue
        </h2>
        
        {pendingConsultations.length === 0 ? (
          <Card className="p-8 text-center bg-surface-sunken border-border border-dashed rounded space-y-2">
            <CheckCircle className="w-8 h-8 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary">Queue Fully Cleared</h3>
            <p className="text-text-secondary text-xs">There are currently no pending consultation requests from users.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingConsultations.map(consultation => (
              <Card key={consultation.id || consultation.consultationId} className="p-6 border-border bg-white rounded space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="warning" className="mb-2">Awaiting Remarks</Badge>
                    <p className="text-xs text-text-muted">
                      Requested: {formatDate(consultation.createdAt)}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleOpenModal(consultation)} rightIcon={Send}>
                    Respond
                  </Button>
                </div>
                
                <div className="space-y-2 bg-surface-sunken p-3 rounded border border-border text-xs">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <User className="w-4 h-4 text-text-secondary" />
                    <span>User ID:</span>
                    <span className="font-bold text-text-primary">{consultation.userId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <FileText className="w-4 h-4 text-text-secondary" />
                    <span>Assessment ID:</span>
                    <Link to={`/assessments/${consultation.assessmentId}`} className="text-text-primary hover:underline font-bold">
                      #{consultation.assessmentId} →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Responded History Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-text-secondary" /> Resolved Advisory History
        </h2>
        
        {respondedConsultations.length === 0 ? (
          <p className="text-text-muted text-xs italic">No resolved consultations recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {respondedConsultations.map(consultation => (
              <Card key={consultation.id || consultation.consultationId} className="p-4 bg-white border-border rounded">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Resolved</Badge>
                    <div>
                      <div className="text-xs font-bold text-text-primary">User #{consultation.userId}</div>
                      <div className="text-xs text-text-muted">{formatDate(consultation.updatedAt)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary italic max-w-md truncate bg-surface-sunken px-3 py-1.5 rounded border border-border">
                    "{consultation.remarks}"
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog for Submitting Remarks */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Advisor Remarks"
        size="lg"
      >
        {selectedConsultation && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-surface-sunken p-3 rounded border border-border text-xs space-y-1">
              <p><span className="text-text-muted">Target User ID:</span> <strong className="text-text-primary">{selectedConsultation.userId}</strong></p>
              <p><span className="text-text-muted">Assessment ID:</span> <strong className="text-text-primary">#{selectedConsultation.assessmentId}</strong></p>
              <p><span className="text-text-muted">Request Date:</span> <span className="text-text-primary">{formatDate(selectedConsultation.createdAt)}</span></p>
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-text-secondary">
                Certified Financial Advice & Action Plan
              </label>
              <textarea
                rows={6}
                {...register('remarks')}
                className="w-full p-3 rounded border border-border-strong bg-white text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500"
                placeholder="Write actionable recommendations regarding debt consolidation, FOIR optimization, or down-payment strategy..."
              />
              {errors.remarks && (
                <p className="text-xs text-text-secondary mt-1">{errors.remarks.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} rightIcon={Send}>
                Submit Advisor Response
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


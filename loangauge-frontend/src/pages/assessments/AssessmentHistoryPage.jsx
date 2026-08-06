import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Plus, Eye, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gauge } from '@/components/ui/Gauge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Loader';
import { useGetAssessmentHistoryQuery } from '@/services/assessmentApi';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function AssessmentHistoryPage() {
  const navigate = useNavigate();
  const { data: assessmentsData = [], isLoading } = useGetAssessmentHistoryQuery();
  const [selectedIds, setSelectedIds] = useState([]);

  const assessments = Array.isArray(assessmentsData) ? assessmentsData : [];

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2 && selectedIds.length <= 5) {
      navigate(`/assessments/compare?ids=${selectedIds.join(',')}`);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Historical Records</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1 flex items-center gap-2">
            Assessment History
            <Badge variant="default">{assessments.length} Total</Badge>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Review past calibrated readiness assessments or select 2+ items to compare.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedIds.length >= 2 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCompare}
              leftIcon={Scale}
            >
              Compare Selected ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/assessments/new')}
            leftIcon={Plus}
          >
            New Assessment
          </Button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Calibrated Assessments Yet"
          description="Run your first loan readiness assessment to calculate your FOIR, DTI, and max eligible borrowing limit."
          action={
            <Button variant="primary" size="md" onClick={() => navigate('/assessments/new')}>
              Run First Assessment
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden border-border bg-white rounded">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-12 text-center">Select</TableHeader>
                <TableHeader>Evaluation Date</TableHeader>
                <TableHeader>Loan Product</TableHeader>
                <TableHeader>Requested Principal</TableHeader>
                <TableHeader className="text-center">Score</TableHeader>
                <TableHeader>Risk Indicator</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((item) => {
                const itemId = item.id || item.assessmentId;
                return (
                  <TableRow key={itemId}>
                    <TableCell className="text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border-strong text-text-primary bg-white cursor-pointer"
                        checked={selectedIds.includes(itemId)}
                        onChange={() => handleSelect(itemId)}
                        disabled={!selectedIds.includes(itemId) && selectedIds.length >= 5}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-text-primary whitespace-nowrap">
                      {formatDate(item.assessmentDate)}
                    </TableCell>
                    <TableCell className="font-bold text-text-primary">{item.loanTypeName || item.loanType?.name || 'Loan Product'}</TableCell>
                    <TableCell className="text-sm font-bold text-text-primary">
                      {formatCurrency(item.loanAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Gauge value={item.financialScore} size="sm" riskLevel={item.riskLevel} showLabel={false} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.riskLevel}>
                        {item.riskLevel?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/assessments/${itemId}`)}
                        leftIcon={Eye}
                      >
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}


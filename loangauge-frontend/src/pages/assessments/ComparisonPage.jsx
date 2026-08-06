import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowLeft, Scale, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gauge } from '@/components/ui/Gauge';
import { PageLoader } from '@/components/ui/Loader';
import { useGetAssessmentHistoryQuery } from '@/services/assessmentApi';
import { useCompareAssessmentsMutation } from '@/services/comparisonApi';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const idsParam = searchParams.get('ids');
  // `idsParam` (a plain string) is the stable dependency here — deriving the
  // array with .split()/.filter() on every render produces a brand-new
  // array reference each time, even when the contents are identical. That
  // new reference used to sit directly in a useEffect dependency array
  // below, which made the effect re-fire on *every* render, which called
  // the mutation, which updated state, which re-rendered, which created a
  // new array again — an infinite loop that hammered the backend and froze
  // the tab. useMemo keyed on the raw string keeps the array referentially
  // stable across renders unless the URL's `ids` param actually changes.
  const initialIds = useMemo(
    () => (idsParam ? idsParam.split(',').filter(Boolean) : []),
    [idsParam]
  );

  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [hasCompared, setHasCompared] = useState(initialIds.length > 0);

  const { data: historyData = [], isLoading: isHistoryLoading } = useGetAssessmentHistoryQuery();
  const [compareAssessments, { data: comparisonDataResponse, isLoading: isComparing }] = useCompareAssessmentsMutation();

  const history = Array.isArray(historyData) ? historyData : [];
  const comparisonData = comparisonDataResponse?.data || comparisonDataResponse;

  useEffect(() => {
    if (initialIds.length >= 2) {
      compareAssessments({ assessmentIds: initialIds });
    }
  }, [initialIds, compareAssessments]);

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2 && selectedIds.length <= 5) {
      // Navigating updates the `ids` URL param, which the effect above
      // picks up (via the memoized initialIds) and triggers the mutation
      // from there — no need to also call it here, which used to fire a
      // redundant duplicate request on every "Run Comparison" click.
      navigate(`/assessments/compare?ids=${selectedIds.join(',')}`);
      setHasCompared(true);
    }
  };

  const colors = {
    primary: '#2158e0',
    secondary: '#97a3b6',
    grid: '#e3e8ef',
    text: '#6b7789'
  };

  if (isHistoryLoading) return <PageLoader />;

  // Selection view if no valid IDs
  if (!hasCompared || selectedIds.length < 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
        <div className="text-center space-y-1">
          <Badge variant="default">Comparison Tool</Badge>
          <h1 className="text-2xl font-bold text-text-primary">Compare Loan Readiness</h1>
          <p className="text-text-secondary text-xs sm:text-sm">Select 2 to 5 past assessments to run side-by-side metric comparison charts.</p>
        </div>

        <Card className="p-6 bg-white border-border rounded space-y-4">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {history.map(assessment => {
              const itemId = assessment.id || assessment.assessmentId;
              const isSelected = selectedIds.includes(itemId);
              return (
                <div 
                  key={itemId}
                  onClick={() => {
                    if (!isSelected && selectedIds.length >= 5) return;
                    handleSelect(itemId);
                  }}
                  className={`p-3 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected 
                      ? 'border-primary-600 bg-surface-sunken' 
                      : 'border-border bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-border-strong text-transparent'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{assessment.loanTypeName || assessment.loanType?.name || 'Loan Assessment'}</h4>
                      <p className="text-xs text-text-muted">{formatDate(assessment.assessmentDate)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-muted">Loan Amount</p>
                      <p className="text-xs font-bold text-text-primary">{formatCurrency(assessment.loanAmount)}</p>
                    </div>
                    <Gauge value={assessment.financialScore} size="sm" riskLevel={assessment.riskLevel} showLabel={false} />
                  </div>
                </div>
              );
            })}
            
            {history.length < 2 && (
              <div className="text-center py-6 text-text-muted text-xs">
                You need at least 2 saved assessments in history to compare.
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">{selectedIds.length} / 5 Selected</span>
            <Button 
              variant="primary" 
              disabled={selectedIds.length < 2}
              onClick={handleCompare}
              leftIcon={Scale}
            >
              Run Side-by-Side Comparison
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isComparing || !comparisonData) return <PageLoader />;

  // Prepare chart data
  const assessmentsList = comparisonData.assessments || [];
  const chartData = assessmentsList.map(a => ({
    name: formatDate(a.assessmentDate).split(',')[0],
    date: a.assessmentDate,
    score: a.financialScore,
    foir: a.foir,
    dti: a.dti,
    savings: a.savingsRatio,
    utilization: a.creditUtilization
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-text-primary font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/assessments" className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Analytics Engine</span>
            <h1 className="text-2xl font-bold text-text-primary">Side-by-Side Assessment Trends</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setHasCompared(false); navigate('/assessments/compare'); }}>
          Change Selected Items
        </Button>
      </div>

      <Card className="p-4 bg-surface-hover border border-border rounded space-y-1">
        <h3 className="text-sm font-bold text-text-primary">Comparative Summary & Recommendations</h3>
        <p className="text-text-secondary text-xs leading-relaxed">{comparisonData.summary}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-white border-border rounded space-y-3">
          <h3 className="text-base font-bold text-text-primary">Financial Score Progress</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis dataKey="name" stroke={colors.text} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke={colors.text} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: colors.grid, borderRadius: '4px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke={colors.primary} strokeWidth={2} dot={{ r: 4, fill: colors.primary }} name="Financial Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-white border-border rounded space-y-3">
          <h3 className="text-base font-bold text-text-primary">Obligations vs Income (FOIR & DTI)</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis dataKey="name" stroke={colors.text} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.text} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: colors.grid, borderRadius: '4px', fontSize: '12px' }}
                  formatter={(value) => `${value}%`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="foir" stroke={colors.primary} fill={colors.primary} fillOpacity={0.1} name="FOIR Ratio" />
                <Area type="monotone" dataKey="dti" stroke={colors.secondary} fill={colors.secondary} fillOpacity={0.1} name="DTI Ratio" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Item cards grid */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h3 className="text-lg font-bold text-text-primary">Detailed Parameter Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {assessmentsList.map(a => (
            <Card key={a.id} className="p-4 flex flex-col items-center justify-between border-border bg-white rounded space-y-2">
              <div className="text-center space-y-0.5">
                <h4 className="font-bold text-text-primary text-sm">{a.loanTypeName || a.loanType?.name}</h4>
                <p className="text-[11px] text-text-muted">{formatDate(a.assessmentDate)}</p>
              </div>
              
              <Gauge value={a.financialScore} size="sm" riskLevel={a.riskLevel} showLabel={false} />
              
              <div className="w-full pt-2 border-t border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Amount</span>
                  <span className="font-bold text-text-primary">{formatCurrency(a.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">EMI</span>
                  <span className="font-bold text-text-primary">{formatCurrency(a.emi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tenure</span>
                  <span className="font-bold text-text-primary">{a.tenureMonths} Mo</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={() => navigate(`/assessments/${a.id}`)}
              >
                View Report
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


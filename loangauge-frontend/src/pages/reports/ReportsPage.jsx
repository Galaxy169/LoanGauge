import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDownloadReportMutation, useEmailReportMutation } from '../../services/notificationService';

export default function ReportsPage() {
  const { assessmentId } = useParams();
  const [downloadReport, { isLoading: downloading }] = useDownloadReportMutation();
  const [emailReport, { isLoading: emailing }] = useEmailReportMutation();
  const [emailInput, setEmailInput] = useState('');

  // TODO: replace with real assessment data fetched from financial-service
  // via assessmentService.js once that endpoint is available — placeholder for now.
  const assessment = {
    loanType: 'PERSONAL',
    loanAmount: '500000',
    foir: '42',
    dti: '35',
    score: '68',
    riskCategory: 'GOOD',
    eligibleAmount: '450000',
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadReport({ assessmentId, ...assessment }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loangauge-report-${assessmentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report');
    }
  };

  const handleEmail = async () => {
    if (!emailInput) {
      toast.error('Enter an email address');
      return;
    }
    try {
      await emailReport({ assessmentId, toEmail: emailInput, ...assessment }).unwrap();
      toast.success('Report emailed');
      setEmailInput('');
    } catch {
      toast.error('Failed to email report');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-1">Assessment Report</h1>
      <p className="text-sm text-gray-500 mb-6">Assessment ID: {assessmentId}</p>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {downloading ? 'Downloading...' : 'Download PDF'}
      </button>

      <div className="mt-6 flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="name@example.com"
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button
          onClick={handleEmail}
          disabled={emailing}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {emailing ? 'Sending...' : 'Email Report'}
        </button>
      </div>
    </div>
  );
}
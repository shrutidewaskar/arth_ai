'use client';

import React, { useState } from 'react';
import { Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiPost } from '@/lib/api';

interface DeveloperSectionProps {
  onRefresh: () => void;
}

export const DeveloperSection: React.FC<DeveloperSectionProps> = ({ onRefresh }) => {
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await apiPost('/api/v1/demo/seed', {});
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: 'Demo household data seeded successfully for Rajesh Sharma.',
        });
        onRefresh();
      } else {
        throw new Error('Failed to seed demo data');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error seeding demo data.',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs space-y-6">
      <div className="flex items-center gap-3 border-b border-amber-200/50 pb-4">
        <div className="h-10 w-10 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-900">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-black text-amber-950 tracking-tight">
            Developer & Demo Controls
          </h3>
          <p className="text-xs text-amber-800 font-semibold">
            Isolated testing sandbox to populate synthetic household scenarios.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/80 rounded-2xl border border-amber-200/60">
        <div>
          <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
            Sharma Family Test Fixture
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-1 max-w-lg">
            Populate sample income sources (₹1.45L/mo), standard expenses (₹60K/mo), assets (₹21L), home loan liabilities, and child education goals for end-to-end engine testing.
          </p>
        </div>

        <button
          onClick={handleSeedDemoData}
          disabled={seeding}
          className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 self-start sm:self-center shrink-0"
        >
          {seeding ? 'Seeding...' : 'Load Demo Scenario'}
        </button>
      </div>
    </div>
  );
};

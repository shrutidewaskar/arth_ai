'use client';

import React, { useState } from 'react';
import { ShieldCheck, Edit3, Save, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { UserProfile } from '@/types/financial';
import { updateProfile } from '@/lib/api';

interface FinancialPreferencesSectionProps {
  profile: UserProfile | null;
  onRefresh: () => void;
}

const RISK_OPTIONS = [
  {
    value: 'Conservative',
    label: 'Conservative',
    description: 'Capital preservation priority. Higher allocation to FDs, liquid funds, and debt instruments.',
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    description: 'Balanced growth and safety. Equities blended with debt for inflation-beating wealth accumulation.',
  },
  {
    value: 'Aggressive',
    label: 'Aggressive',
    description: 'Maximum long-term compounding. High equity allocation tolerant of short-term volatility.',
  },
];

export const FinancialPreferencesSection: React.FC<FinancialPreferencesSectionProps> = ({
  profile,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [riskAppetite, setRiskAppetite] = useState<string>(profile?.risk_appetite || 'Moderate');

  const handleStartEdit = () => {
    setRiskAppetite(profile?.risk_appetite || 'Moderate');
    setFeedback(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    setSaving(true);
    try {
      await updateProfile({
        risk_appetite: riskAppetite,
      });

      setFeedback({
        type: 'success',
        message: 'Financial preferences updated successfully.',
      });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update financial preferences.',
      });
    } finally {
      setSaving(false);
    }
  };

  const currentRisk = RISK_OPTIONS.find(
    (o) => o.value.toLowerCase() === (profile?.risk_appetite || 'moderate').toLowerCase()
  ) || RISK_OPTIONS[1];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-slate-800 tracking-tight">
              Financial Preferences
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Strategic risk tolerance guiding CFO advisory and asset allocation modeling.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-black rounded-xl transition self-start sm:self-center"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Preferences</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${feedback.type === 'success'
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

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Investment Risk Appetite
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RISK_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${riskAppetite === opt.value
                      ? 'bg-emerald-50/60 border-primary shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800">{opt.label}</span>
                    <input
                      type="radio"
                      name="risk_appetite"
                      value={opt.value}
                      checked={riskAppetite === opt.value}
                      onChange={(e) => setRiskAppetite(e.target.value)}
                      disabled={saving}
                      className="accent-primary"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {opt.description}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary hover:bg-[#074739] text-white text-xs font-black rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Current Risk Profile
              </span>
            </div>
            <p className="text-sm font-black text-slate-800">{currentRisk.label}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              {currentRisk.description}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Reasoning Engine Impact
            </span>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Passed directly as deterministic context into the AI CFO and Goal Feasibility Engine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

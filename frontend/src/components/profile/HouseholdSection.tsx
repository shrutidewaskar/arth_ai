'use client';

import React, { useState } from 'react';
import { Users, Edit3, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/types/financial';
import { updateProfile } from '@/lib/api';

interface HouseholdSectionProps {
  profile: UserProfile | null;
  onRefresh: () => void;
}

export const HouseholdSection: React.FC<HouseholdSectionProps> = ({ profile, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [dependents, setDependents] = useState<string>(
    profile?.dependents !== undefined ? String(profile.dependents) : '0'
  );

  const handleStartEdit = () => {
    setDependents(profile?.dependents !== undefined ? String(profile.dependents) : '0');
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

    const parsedDependents = parseInt(dependents, 10);
    if (isNaN(parsedDependents) || parsedDependents < 0 || parsedDependents > 20) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid number of dependents (0 - 20).',
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        dependents: parsedDependents,
      });

      setFeedback({
        type: 'success',
        message: 'Household information updated successfully.',
      });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update household information.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-slate-800 tracking-tight">
              Household Context
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Family members and financial dependents supported by your household income.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-black rounded-xl transition self-start sm:self-center"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Household</span>
          </button>
        )}
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

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Financial Dependents
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              disabled={saving}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Children, elderly parents, or non-earning family members.
            </p>
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
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Total Dependents
              </span>
            </div>
            <p className="text-sm font-black text-slate-800">
              {profile?.dependents !== undefined ? `${profile.dependents} Dependent(s)` : '0 Dependents'}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Emergency Cushion Multiplier
            </span>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Standard 3–6 months emergency runway automatically adjusts based on dependent count.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

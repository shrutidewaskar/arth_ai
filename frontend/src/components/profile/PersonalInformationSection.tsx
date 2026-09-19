'use client';

import React, { useState } from 'react';
import { User, Edit3, Save, X, AlertCircle, CheckCircle2, MapPin, Briefcase, Calendar, Heart } from 'lucide-react';
import { UserProfile } from '@/types/financial';
import { updateProfile } from '@/lib/api';

interface PersonalInformationSectionProps {
  profile: UserProfile | null;
  onRefresh: () => void;
}

export const PersonalInformationSection: React.FC<PersonalInformationSectionProps> = ({
  profile,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [city, setCity] = useState(profile?.city || '');
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '');
  const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status || 'Single');

  const handleStartEdit = () => {
    setOccupation(profile?.occupation || '');
    setCity(profile?.city || '');
    setAge(profile?.age ? String(profile.age) : '');
    setMaritalStatus(profile?.marital_status || 'Single');
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

    const parsedAge = age ? parseInt(age, 10) : undefined;
    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 120)) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid age between 18 and 120.',
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        occupation: occupation.trim() || undefined,
        city: city.trim() || undefined,
        age: parsedAge,
        marital_status: maritalStatus,
      });

      setFeedback({
        type: 'success',
        message: 'Personal information updated successfully.',
      });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update personal information.',
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
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-slate-800 tracking-tight">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Demographic profile used for life-stage financial modeling.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-black rounded-xl transition self-start sm:self-center"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Information</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, Doctor, Consultant"
                disabled={saving}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Current City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Bengaluru, Pune"
                disabled={saving}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 32"
                disabled={saving}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                disabled={saving}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Occupation</span>
            </div>
            <p className="text-sm font-black text-slate-800">
              {profile?.occupation || <span className="text-slate-400 font-semibold italic">Not specified</span>}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">City</span>
            </div>
            <p className="text-sm font-black text-slate-800">
              {profile?.city || <span className="text-slate-400 font-semibold italic">Not specified</span>}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Age</span>
            </div>
            <p className="text-sm font-black text-slate-800">
              {profile?.age && profile.age > 0 ? `${profile.age} yrs` : <span className="text-slate-400 font-semibold italic">Not specified</span>}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Marital Status</span>
            </div>
            <p className="text-sm font-black text-slate-800">
              {profile?.marital_status || <span className="text-slate-400 font-semibold italic">Not specified</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

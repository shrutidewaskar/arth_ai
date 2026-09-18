import React from "react";
import { UserProfile } from "@/types/financial";
import { Sparkles, HelpCircle } from "lucide-react";

interface AboutYouStepProps {
  fullName: string;
  setFullName: (val: string) => void;
  age: number | "";
  setAge: (val: number | "") => void;
  city: string;
  setCity: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  maritalStatus: string;
  setMaritalStatus: (val: string) => void;
  dependents: number;
  setDependents: (val: number) => void;
}

export function AboutYouStep({
  fullName,
  setFullName,
  age,
  setAge,
  city,
  setCity,
  occupation,
  setOccupation,
  maritalStatus,
  setMaritalStatus,
  dependents,
  setDependents
}: AboutYouStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">About You</h3>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Tell us about your household structure so we can calculate relevant tax thresholds, life-stage allocations, and risk profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Rajesh Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Age
          </label>
          <input
            type="number"
            placeholder="e.g. 34"
            value={age}
            onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            City of Residence
          </label>
          <input
            type="text"
            placeholder="e.g. Bengaluru / Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Occupation / Employment
          </label>
          <input
            type="text"
            placeholder="e.g. Software Engineer / Consultant"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Marital Status
          </label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Married with Kids">Married with Kids</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Financial Dependents
          </label>
          <input
            type="number"
            placeholder="e.g. 2 (Children/Parents)"
            value={dependents}
            onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
        </div>
      </div>
    </div>
  );
}

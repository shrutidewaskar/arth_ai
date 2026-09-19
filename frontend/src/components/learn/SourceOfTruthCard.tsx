import React from "react";
import { FileCode2, Terminal } from "lucide-react";

interface SourceFileRef {
  filePath: string;
  role: string;
}

interface SourceOfTruthCardProps {
  title?: string;
  description?: string;
  files: SourceFileRef[];
}

export function SourceOfTruthCard({
  title = "Backend Source-of-Truth Architecture",
  description = "Every metric and model described above is implemented deterministically in these active repository components:",
  files,
}: SourceOfTruthCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
          <Terminal className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">{title}</h3>
          <p className="text-[11px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {files.map((f, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <code className="text-xs font-mono text-emerald-300 font-semibold">{f.filePath}</code>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{f.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

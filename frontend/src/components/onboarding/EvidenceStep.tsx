import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
  X,
  Edit2,
  Trash2,
  Loader2,
  ArrowRight,
  Info,
} from "lucide-react";
import { VaultDocument, CandidateEntity } from "@/types/financial";
import {
  apiGet,
  apiPost,
  apiDelete,
  getCandidates,
  approveCandidate,
  rejectCandidate,
  editCandidate,
} from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";

interface EvidenceStepProps {
  onApprovedFactCountChange?: (count: number) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function EvidenceStep({
  onApprovedFactCountChange,
  onContinue,
  onSkip,
}: EvidenceStepProps) {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [candidates, setCandidates] = useState<CandidateEntity[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Edit modal state
  const [editingCandidate, setEditingCandidate] = useState<CandidateEntity | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  const [approvedCount, setApprovedCount] = useState<number>(0);

  const refreshEvidence = async () => {
    try {
      setLoadingData(true);
      // 1. Fetch Documents
      const docRes = await apiGet("/api/v1/documents");
      if (docRes.ok) {
        const docJson = await docRes.json();
        setDocuments(docJson);
      }

      // 2. Fetch Candidates
      const candRes = await getCandidates();
      const allCands = candRes.candidates || [];
      setCandidates(allCands);

      const approved = allCands.filter((c) => c.status === "APPROVED").length;
      setApprovedCount(approved);
      if (onApprovedFactCountChange) onApprovedFactCountChange(approved);
    } catch (err) {
      console.error("Error refreshing evidence step data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshEvidence();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiPost("/api/v1/documents/upload", formData);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Document upload & processing failed.");
      }
      const data = await res.json();
      setFeedback({
        type: "success",
        message: `Processed "${file.name}" as ${data.document_type}. Extracted ${data.facts_extracted} facts. Candidates ready for your review below!`,
      });
      await refreshEvidence();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to parse document.",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleApprove = async (candId: string) => {
    try {
      await approveCandidate(candId);
      setFeedback({
        type: "success",
        message: "Financial fact approved and added to your canonical profile!",
      });
      await refreshEvidence();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Approval failed: ${err.message}`,
      });
    }
  };

  const handleReject = async (candId: string) => {
    try {
      await rejectCandidate(candId);
      setFeedback({
        type: "info",
        message: "Candidate discarded. Canonical records were not modified.",
      });
      await refreshEvidence();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Rejection failed: ${err.message}`,
      });
    }
  };

  const handleOpenEdit = (cand: CandidateEntity) => {
    setEditingCandidate(cand);
    setEditFormData({ ...cand.suggested_data });
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;
    try {
      await editCandidate(editingCandidate.id, editFormData);
      setFeedback({
        type: "success",
        message: "Candidate edited and committed to canonical records!",
      });
      setEditingCandidate(null);
      await refreshEvidence();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Save failed: ${err.message}`,
      });
    }
  };

  const pendingCandidates = candidates.filter((c) => c.status === "PENDING_REVIEW");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">
            Connect Financial Evidence (Optional)
          </h3>
          <span className="text-[10px] bg-emerald-50 text-primary font-black px-2.5 py-1 rounded-full uppercase">
            Human-In-The-Loop Gate
          </span>
        </div>
        <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
          Upload bank statements, loan sanction letters, or salary slips. ArthAI extracts candidate financial facts that you can review, edit, and approve before they enter your balance sheet.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2.5 ${feedback.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : feedback.type === "info"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : feedback.type === "info" ? (
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-500/50 transition p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
        <input
          type="file"
          id="onboarding-pdf-uploader"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="onboarding-pdf-uploader"
          className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#074739] transition shadow-md ${uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing & Extracting Facts...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Financial PDF Statement
            </>
          )}
        </label>
        <p className="text-[11px] text-slate-400 font-semibold max-w-md">
          Supported: Bank Statements (HDFC, SBI, ICICI), Loan Schedules, Salary Slips, Investment CAS.
        </p>
      </div>

      {/* Documents Uploaded during Onboarding */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            Uploaded Documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800">{doc.file_name}</h5>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {doc.document_type} • {doc.status}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                  {doc.facts_count ?? 0} facts extracted
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Review Queue */}
      {pendingCandidates.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Candidate Financial Facts ({pendingCandidates.length} To Review)
            </h4>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-black border border-amber-200 uppercase">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {pendingCandidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-amber-50 text-amber-800 font-black px-2 py-0.5 rounded border border-amber-200 uppercase">
                      {cand.candidate_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Confidence: {(cand.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 font-bold pt-1">
                    {Object.entries(cand.suggested_data).map(([k, v]) => (
                      <span key={k} className="mr-3 inline-block">
                        <span className="text-slate-400 font-normal uppercase text-[9px]">{k}:</span>{" "}
                        {typeof v === "number" ? `₹${v.toLocaleString()}` : String(v)}
                      </span>
                    ))}
                  </div>

                  {cand.provenance && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Source: {cand.provenance.file_name || "Document"} (Page {cand.provenance.source_page || 1})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(cand.id)}
                    className="px-3 py-1.5 bg-primary hover:bg-[#074739] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cand)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleReject(cand.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-display text-base font-black text-slate-800">
              Edit Candidate Financial Fact
            </h4>
            <div className="space-y-3">
              {Object.entries(editFormData).map(([k, v]) => (
                <div key={k}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {k}
                  </label>
                  <input
                    type={typeof v === "number" ? "number" : "text"}
                    value={v}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        [k]: typeof v === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-[#074739]"
              >
                Save & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper callout */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600 font-medium">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p>
          You can skip uploading documents now and add them anytime later in the <strong>Evidence Hub</strong>. Manual entries from earlier steps will form your baseline snapshot.
        </p>
      </div>
    </div>
  );
}

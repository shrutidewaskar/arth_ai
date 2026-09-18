import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
  Check,
  X,
  Edit2,
  Eye,
  Layers,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { VaultDocument, CandidateEntity, ReconciliationConflict } from "@/types/financial";
import {
  apiPost,
  getDocument,
  deleteDocument,
  DocumentDetailResponse,
  getCandidates,
  approveCandidate,
  rejectCandidate,
  editCandidate,
  getConflicts,
  resolveConflict,
} from "@/lib/api";
import { EmptyState, LoadingState, StatusBadge } from "@/components/shared/UIStates";
import { DeleteConfirmationModal } from "@/components/money/DeleteConfirmationModal";

interface EvidenceHubProps {
  vaultDocuments: VaultDocument[];
  onRefresh: () => void;
  initialSubTab?: string;
}

export function EvidenceHub({
  vaultDocuments,
  onRefresh,
  initialSubTab = "vault",
}: EvidenceHubProps) {
  const [subTab, setSubTab] = useState<string>(initialSubTab);
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Document Vault State
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentDetailResponse | null>(null);
  const [loadingDocDetails, setLoadingDocDetails] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");

  // Document Deletion State
  const [deletingDoc, setDeletingDoc] = useState<VaultDocument | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Candidate Review Queue State
  const [candidates, setCandidates] = useState<CandidateEntity[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<string>("PENDING_REVIEW");
  const [candidateFeedback, setCandidateFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Edit modal state
  const [editingCandidate, setEditingCandidate] = useState<CandidateEntity | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Reconciliation conflicts state
  const [conflicts, setConflicts] = useState<ReconciliationConflict[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [conflictFeedback, setConflictFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [customValueInputs, setCustomValueInputs] = useState<Record<string, string>>({});

  const fetchCandidatesData = async (status?: string) => {
    try {
      setLoadingCandidates(true);
      const res = await getCandidates(status === "ALL" ? undefined : status || candidateStatusFilter);
      setCandidates(res.candidates || []);
    } catch (err: any) {
      console.error("Error loading candidate entities:", err);
      setCandidateFeedback({
        type: "error",
        message: err.message || "Failed to load candidate entities.",
      });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchConflictsData = async () => {
    try {
      setLoadingConflicts(true);
      const res = await getConflicts();
      setConflicts(res.conflicts || []);
    } catch (err: any) {
      console.error("Error loading reconciliation conflicts:", err);
      setConflictFeedback({
        type: "error",
        message: err.message || "Failed to load reconciliation conflicts.",
      });
    } finally {
      setLoadingConflicts(false);
    }
  };

  useEffect(() => {
    if (subTab === "review_queue") {
      fetchCandidatesData(candidateStatusFilter);
    } else if (subTab === "conflicts") {
      fetchConflictsData();
    }
  }, [subTab, candidateStatusFilter]);

  // View Document Details in Drawer/Modal
  const handleViewDocumentDetails = async (docId: string) => {
    try {
      setSelectedDocId(docId);
      setLoadingDocDetails(true);
      const details = await getDocument(docId);
      setSelectedDocDetails(details);
    } catch (err: any) {
      console.error("Failed to load document details:", err);
      setUploadFeedback({
        type: "error",
        message: err.message || "Failed to load document details.",
      });
    } finally {
      setLoadingDocDetails(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiPost("/api/v1/documents/upload", formData);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload processing failed");
      }
      const data = await res.json();
      setUploadFeedback({
        type: "success",
        message: `Successfully processed "${file.name}" as ${data.document_type || "financial document"}. Extracted ${data.facts_extracted || 0} facts (${data.chunks_created || 0} text chunks). Candidates queued for your review!`,
      });
      onRefresh();
      fetchCandidatesData();
    } catch (err: any) {
      setUploadFeedback({
        type: "error",
        message: err.message || "Failed to process document.",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmDeleteDocument = async () => {
    if (!deletingDoc) return;
    try {
      setDeleteLoading(true);
      await deleteDocument(deletingDoc.id);
      setUploadFeedback({
        type: "success",
        message: `Document "${deletingDoc.file_name}" and its associated chunks were removed.`,
      });
      setDeletingDoc(null);
      if (selectedDocId === deletingDoc.id) {
        setSelectedDocId(null);
        setSelectedDocDetails(null);
      }
      onRefresh();
    } catch (err: any) {
      setUploadFeedback({
        type: "error",
        message: `Failed to delete document: ${err.message}`,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApprove = async (candId: string) => {
    try {
      await approveCandidate(candId);
      setCandidateFeedback({
        type: "success",
        message: "Candidate approved and merged into your canonical balance sheet!",
      });
      fetchCandidatesData(candidateStatusFilter);
      onRefresh();
    } catch (err: any) {
      setCandidateFeedback({
        type: "error",
        message: `Approval error: ${err.message}`,
      });
    }
  };

  const handleReject = async (candId: string) => {
    try {
      await rejectCandidate(candId);
      setCandidateFeedback({
        type: "success",
        message: "Candidate rejected. Canonical financial state remains untouched.",
      });
      fetchCandidatesData(candidateStatusFilter);
      onRefresh();
    } catch (err: any) {
      setCandidateFeedback({
        type: "error",
        message: `Rejection error: ${err.message}`,
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
      setSavingEdit(true);
      await editCandidate(editingCandidate.id, editFormData);
      setCandidateFeedback({
        type: "success",
        message: "Candidate edited and committed to canonical financial state!",
      });
      setEditingCandidate(null);
      fetchCandidatesData(candidateStatusFilter);
      onRefresh();
    } catch (err: any) {
      setCandidateFeedback({
        type: "error",
        message: `Save error: ${err.message}`,
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResolveConflict = async (
    candId: string,
    decision: "ACCEPT_SUGGESTED" | "KEEP_CANONICAL" | "CUSTOM"
  ) => {
    try {
      const customVal = decision === "CUSTOM" ? customValueInputs[candId] : undefined;
      await resolveConflict(candId, decision, customVal);
      setConflictFeedback({
        type: "success",
        message: `Conflict successfully resolved (${decision.replace("_", " ")}). Canonical ledger updated!`,
      });
      fetchConflictsData();
      onRefresh();
    } catch (err: any) {
      setConflictFeedback({
        type: "error",
        message: `Resolution error: ${err.message}`,
      });
    }
  };

  // Filtered documents
  const filteredDocuments = vaultDocuments.filter((doc) => {
    const matchesSearch = doc.file_name.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesType = docTypeFilter === "ALL" || doc.document_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const uniqueDocTypes = Array.from(new Set(vaultDocuments.map((d) => d.document_type))).filter(Boolean);

  const pendingCount = candidates.filter((c) => c.status === "PENDING_REVIEW").length;

  return (
    <div className="space-y-6">
      {/* Top Hub Bar with Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-black text-slate-800 tracking-tight">
              Evidence Center
            </h2>
            <span className="text-[10px] bg-emerald-50 text-[#0B5D4B] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200/60">
              Explainability & Truth
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            <strong className="text-slate-700">Money</strong> tells you what ArthAI believes. <strong className="text-slate-700">Evidence</strong> lets you inspect why ArthAI believes it.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setSubTab("vault")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === "vault"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Documents ({vaultDocuments.length})
          </button>
          <button
            onClick={() => setSubTab("review_queue")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === "review_queue"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Review Queue</span>
            {pendingCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 bg-amber-600 text-white text-[9px] rounded-full flex items-center justify-center font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab("conflicts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === "conflicts"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Conflicts</span>
            {conflicts.length > 0 && (
              <span className="h-4 min-w-[16px] px-1 bg-rose-600 text-white text-[9px] rounded-full flex items-center justify-center font-black">
                {conflicts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DOCUMENTS SECTION                                                     */}
      {/* ========================================================================= */}
      {subTab === "vault" && (
        <div className="space-y-6">
          {uploadFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                uploadFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {uploadFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{uploadFeedback.message}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-200/90 p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition hover:border-[#0B5D4B]/40">
            <input
              type="file"
              id="pdf-vault-uploader"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="pdf-vault-uploader"
              className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-[#0B5D4B] text-white rounded-2xl text-xs font-black hover:bg-[#074739] transition shadow-md ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Ingesting, Parsing & Extracting Facts..." : "Upload Financial Document (PDF)"}
            </label>
            <p className="text-[11px] text-slate-500 font-semibold max-w-md leading-relaxed">
              Upload bank statements, salary slips, loan contracts, mutual fund CAS, or insurance policies. ArthAI will parse facts deterministically into a review queue.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          {vaultDocuments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents by filename..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B5D4B]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Type:</span>
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                >
                  <option value="ALL">All Types</option>
                  {uniqueDocTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="space-y-3">
            {vaultDocuments.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No financial documents yet"
                description="Upload a bank statement, investment statement, loan schedule, salary slip, or insurance document to help ArthAI understand your finances."
                actionLabel="Upload First Document"
                onAction={() => document.getElementById("pdf-vault-uploader")?.click()}
              />
            ) : filteredDocuments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-150">
                <p className="text-xs font-bold text-slate-500">No documents match your filter criteria.</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const statusStyle =
                  doc.status === "PROCESSED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : doc.status === "FAILED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                return (
                  <div
                    key={doc.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0B5D4B]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-black text-slate-800">{doc.file_name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${statusStyle}`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-450 font-bold mt-1">
                          <span className="uppercase text-slate-600">{doc.document_type}</span>
                          {doc.uploaded_at && (
                            <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          )}
                          {doc.file_size && (
                            <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                        <Layers className="h-3 w-3 text-slate-500" />
                        {doc.facts_count ?? 0} facts
                      </span>
                      <button
                        onClick={() => handleViewDocumentDetails(doc.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                        title="Inspect extracted facts"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => setDeletingDoc(doc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REVIEW QUEUE SECTION (Human-in-the-Loop Gate)                          */}
      {/* ========================================================================= */}
      {subTab === "review_queue" && (
        <div className="space-y-6">
          {candidateFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                candidateFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {candidateFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{candidateFeedback.message}</span>
            </div>
          )}

          {/* Review Queue Status Header & Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Extracted Candidate Entities
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                These financial items were extracted from evidence but are not yet part of your canonical financial state.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {[
                { label: "Pending", value: "PENDING_REVIEW" },
                { label: "Approved", value: "APPROVED" },
                { label: "Edited", value: "EDITED" },
                { label: "Rejected", value: "REJECTED" },
                { label: "All", value: "ALL" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setCandidateStatusFilter(f.value)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    candidateStatusFilter === f.value
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loadingCandidates ? (
            <LoadingState message="Loading candidate entities from evidence pipeline..." />
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={
                candidateStatusFilter === "PENDING_REVIEW"
                  ? "Nothing needs your review"
                  : `No ${candidateStatusFilter.toLowerCase()} candidates`
              }
              description={
                candidateStatusFilter === "PENDING_REVIEW"
                  ? "New financial information extracted from your documents will appear here when it requires your approval."
                  : "Items that you approve, edit, or reject will be recorded in their respective status queues."
              }
            />
          ) : (
            <div className="space-y-4">
              {candidates.map((cand) => {
                const isPending = cand.status === "PENDING_REVIEW";
                const isApproved = cand.status === "APPROVED" || cand.status === "EDITED";

                return (
                  <div
                    key={cand.id}
                    className={`bg-white p-5 rounded-2xl border shadow-xs transition space-y-3 ${
                      isPending
                        ? "border-amber-200/80 hover:border-amber-300"
                        : isApproved
                        ? "border-emerald-200/60 bg-emerald-50/10"
                        : "border-slate-200 opacity-80"
                    }`}
                  >
                    {/* Header: Candidate Type, Status, Confidence */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-900 text-white font-black px-2.5 py-0.5 rounded uppercase">
                          {cand.candidate_type}
                        </span>
                        <StatusBadge
                          status={cand.status}
                          variant={
                            isPending ? "amber" : isApproved ? "emerald" : "rose"
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">
                          Extraction Confidence: {(cand.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Extracted Values Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      {Object.entries(cand.suggested_data || {}).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-[10px] text-slate-450 font-bold uppercase block truncate">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-black text-slate-800 block truncate mt-0.5">
                            {typeof value === "number"
                              ? key.toLowerCase().includes("rate") || key.toLowerCase().includes("pct")
                                ? `${value}%`
                                : `₹${value.toLocaleString("en-IN")}`
                              : String(value ?? "—")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Provenance Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        {cand.provenance?.file_name && (
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <FileText className="h-3.5 w-3.5 text-[#0B5D4B]" />
                            {cand.provenance.file_name}
                          </span>
                        )}
                        {cand.provenance?.source_page && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            Page {cand.provenance.source_page}
                          </span>
                        )}
                        {cand.provenance?.raw_description && (
                          <span className="text-slate-400 italic truncate max-w-xs">
                            "{cand.provenance.raw_description}"
                          </span>
                        )}
                      </div>

                      {/* Review Actions */}
                      {isPending ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(cand.id)}
                            className="px-3.5 py-1.5 bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-black rounded-xl flex items-center gap-1 transition shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cand)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleReject(cand.id)}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {isApproved
                            ? "Merged into Canonical Ledger"
                            : "Excluded from Balance Sheet"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RECONCILIATION CONFLICTS SECTION                                       */}
      {/* ========================================================================= */}
      {subTab === "conflicts" && (
        <div className="space-y-6">
          {conflictFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                conflictFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {conflictFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{conflictFeedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Multi-Source Reconciliation Conflicts ({conflicts.length})
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Occurs when new evidence contradicts an existing canonical financial record. Choose which source reflects reality.
              </p>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-black px-2.5 py-1 rounded-full uppercase">
              Resolver Active
            </span>
          </div>

          {loadingConflicts ? (
            <LoadingState message="Checking multi-source reconciliation records..." />
          ) : conflicts.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="No reconciliation conflicts detected"
              description="Your canonical ledger and extracted evidence documents are in complete agreement."
            />
          ) : (
            <div className="space-y-4">
              {conflicts.map((conf, idx) => {
                const candId = conf.candidate_id;
                const customVal = customValueInputs[candId] || "";

                return (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-700 uppercase">
                          Conflict in {conf.candidate_type} ({conf.field_name})
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-black uppercase">
                        Recommended: {conf.recommended_action}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                      {conf.explanation}
                    </p>

                    {/* Side-by-Side Sources Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Canonical Source */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Current Canonical Record
                        </span>
                        <div className="text-sm font-black text-slate-800">
                          {typeof conf.canonical_value === "number"
                            ? `₹${conf.canonical_value.toLocaleString("en-IN")}`
                            : String(conf.canonical_value)}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Source: {conf.canonical_source}
                        </p>
                      </div>

                      {/* Suggested Evidence Source */}
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                          New Suggested Evidence
                        </span>
                        <div className="text-sm font-black text-[#0B5D4B]">
                          {typeof conf.suggested_value === "number"
                            ? `₹${conf.suggested_value.toLocaleString("en-IN")}`
                            : String(conf.suggested_value)}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Source: {conf.suggested_source}
                        </p>
                      </div>
                    </div>

                    {/* Custom Value Input */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder="Or enter custom reconciled value..."
                        value={customVal}
                        onChange={(e) =>
                          setCustomValueInputs({
                            ...customValueInputs,
                            [candId]: e.target.value,
                          })
                        }
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl grow"
                      />
                      <button
                        onClick={() => handleResolveConflict(candId, "CUSTOM")}
                        disabled={!customVal}
                        className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
                      >
                        Set Custom
                      </button>
                    </div>

                    {/* Decision Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleResolveConflict(candId, "KEEP_CANONICAL")}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        Keep Canonical
                      </button>
                      <button
                        onClick={() => handleResolveConflict(candId, "ACCEPT_SUGGESTED")}
                        className="px-4 py-2 bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-black rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <span>Accept Suggested</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCUMENT DETAIL MODAL / DRAWER                                         */}
      {/* ========================================================================= */}
      {selectedDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-[#0B5D4B] flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-black text-slate-800">
                    {selectedDocDetails?.file_name || "Document Details"}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase">
                    {selectedDocDetails?.document_type} • Status: {selectedDocDetails?.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDocId(null);
                  setSelectedDocDetails(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-5">
              {loadingDocDetails ? (
                <LoadingState message="Retrieving deterministic extracted facts..." />
              ) : selectedDocDetails ? (
                <>
                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Facts Extracted</span>
                      <span className="font-black text-slate-800 text-sm mt-0.5 block">
                        {selectedDocDetails.facts_extracted}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Text Chunks</span>
                      <span className="font-black text-slate-800 text-sm mt-0.5 block">
                        {selectedDocDetails.chunks_created}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Uploaded</span>
                      <span className="font-black text-slate-800 text-xs mt-0.5 block truncate">
                        {new Date(selectedDocDetails.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline</span>
                      <span className="font-black text-emerald-700 text-xs mt-0.5 block">
                        Deterministic
                      </span>
                    </div>
                  </div>

                  {/* Extracted Facts List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 flex items-center justify-between border-b pb-2">
                      <span>Extracted Financial Facts ({selectedDocDetails.extracted_facts?.length || 0})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Page-level provenance</span>
                    </h4>

                    {(!selectedDocDetails.extracted_facts || selectedDocDetails.extracted_facts.length === 0) ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No financial facts were extracted from this document.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {selectedDocDetails.extracted_facts.map((fact, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3 transition"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-slate-200 text-slate-700 font-black px-1.5 py-0.5 rounded uppercase">
                                  {fact.fact_type}
                                </span>
                                <span className="font-bold text-slate-800">{fact.fact_key}</span>
                              </div>
                              <div className="text-xs font-black text-[#0B5D4B] mt-1">
                                {typeof fact.fact_value === "number"
                                  ? `₹${fact.fact_value.toLocaleString("en-IN")}`
                                  : String(fact.fact_value)}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-bold text-slate-600 block">
                                Page {fact.source_page ?? 1}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold mt-1 block">
                                Conf: {(fact.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDocId(null);
                  setSelectedDocDetails(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CANDIDATE EDIT MODAL                                                   */}
      {/* ========================================================================= */}
      {editingCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-display text-base font-black text-slate-800">
                  Edit Candidate Entity
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  {editingCandidate.candidate_type}
                </p>
              </div>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {Object.entries(editFormData).map(([k, v]) => (
                <div key={k}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {k.replace(/_/g, " ")}
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
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0B5D4B]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingCandidate(null)}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#0B5D4B] text-white hover:bg-[#074739] transition shadow-xs flex items-center gap-2"
              >
                {savingEdit ? "Saving..." : "Save & Commit to Ledger"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE DOCUMENT CONFIRMATION MODAL                                     */}
      {/* ========================================================================= */}
      {deletingDoc && (
        <DeleteConfirmationModal
          isOpen={!!deletingDoc}
          title="Delete Financial Document"
          entityName={deletingDoc.file_name}
          entityType="Document"
          onConfirm={handleConfirmDeleteDocument}
          onCancel={() => setDeletingDoc(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

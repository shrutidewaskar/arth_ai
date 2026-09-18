import React, { useState } from "react";
import { FolderOpen, FileText, Trash2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { VaultDocument } from "@/types/financial";
import { apiPost, apiDelete } from "@/lib/api";
import { EmptyState } from "@/components/shared/UIStates";

interface DocumentVaultTabProps {
  vaultDocuments: VaultDocument[];
  onRefresh: () => void;
}

export function DocumentVaultTab({ vaultDocuments, onRefresh }: DocumentVaultTabProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
        message: `Successfully processed ${file.name}! Classified as ${data.document_type} with ${data.facts_extracted} facts extracted.`,
      });
      onRefresh();
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

  const handleDeleteDocument = async (id: string, name: string) => {
    try {
      const res = await apiDelete(`/api/v1/documents/${id}`);
      if (res.ok) {
        setUploadFeedback({
          type: "success",
          message: `Document "${name}" deleted.`,
        });
        onRefresh();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err: any) {
      setUploadFeedback({
        type: "error",
        message: `Failed to delete document: ${err.message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-display text-base font-bold text-slate-700">Financial Evidence Center</h3>
        <span className="text-[10px] bg-emerald-50 text-primary px-3 py-1 rounded-full font-bold">
          {vaultDocuments.length} Documents Indexed
        </span>
      </div>

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

      <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
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
          className={`cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-[#0B5D4B] text-white rounded-2xl text-xs font-bold hover:bg-[#074739] transition shadow-md ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Parsing & Extracting Facts..." : "Upload Financial PDF"}
        </label>
        <p className="text-[10px] text-slate-450 font-semibold max-w-sm">
          Bank Statements, Salary Slips, Loan Contracts, Investment CAS, and Insurance Policies are parsed deterministically into candidate evidence.
        </p>
      </div>

      <div className="space-y-3">
        {vaultDocuments.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No documents stored in vault yet"
            description="Upload your bank statements or loan schedules to generate verified evidence."
          />
        ) : (
          vaultDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">{doc.file_name}</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">
                    {doc.document_type} • {doc.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  {doc.facts_count ?? 0} facts extracted
                </span>
                <button
                  onClick={() => handleDeleteDocument(doc.id, doc.file_name)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

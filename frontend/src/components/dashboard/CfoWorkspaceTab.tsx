import React, { useRef, useEffect } from "react";
import { Brain, Sparkles, Send } from "lucide-react";
import { CfoMessage } from "@/types/financial";

interface CfoWorkspaceTabProps {
  cfoMessages: CfoMessage[];
  cfoInput: string;
  setCfoInput: (val: string) => void;
  cfoThinking: boolean;
  cfoThinkingSteps: string[];
  cfoStreaming: boolean;
  suggestedActions: string[];
  handleCfoChat: (e: React.FormEvent) => void;
}

export function CfoWorkspaceTab({
  cfoMessages,
  cfoInput,
  setCfoInput,
  cfoThinking,
  cfoThinkingSteps,
  cfoStreaming,
  suggestedActions,
  handleCfoChat,
}: CfoWorkspaceTabProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cfoMessages]);

  return (
    <div className="flex flex-col h-[520px] bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden relative">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <span className="text-xs font-bold text-slate-655 flex items-center gap-1.5">
          <Brain className="h-4.5 w-4.5 text-emerald-700" /> AI Family CFO Advisory Loop
        </span>
        <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
          Models synced
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {cfoMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-4 rounded-3xl max-w-md text-xs md:text-sm font-semibold shadow-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-white border border-slate-200/60 text-slate-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {cfoThinking && (
          <div className="bg-white border border-slate-200/50 p-4 rounded-3xl max-w-sm text-xs font-bold text-slate-500 space-y-2">
            <p className="flex items-center gap-2 text-primary font-black">
              <Sparkles className="h-4 w-4 animate-spin" /> Thinking process...
            </p>
            <ul className="space-y-1 pl-4 border-l border-slate-200">
              {cfoThinkingSteps.map((step, idx) => (
                <li key={idx} className="text-[10px] text-slate-400 flex items-center gap-1">
                  ✅ {step}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {cfoStreaming && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-b border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-800 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          AI CFO is streaming real-time calculations...
        </div>
      )}

      <div className="p-4 bg-white border-t space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((act) => (
            <button
              key={act}
              onClick={() => setCfoInput(act)}
              className="text-[10px] bg-slate-50 hover:bg-slate-100/80 text-slate-600 px-3 py-1.5 rounded-full font-bold border border-slate-200/50 transition-colors"
            >
              {act}
            </button>
          ))}
        </div>

        <form onSubmit={handleCfoChat} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI CFO, e.g. 'Can I invest in mutual funds instead of prepaying loan?'"
            value={cfoInput}
            onChange={(e) => setCfoInput(e.target.value)}
            className="flex-1 bg-slate-50 border px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold focus:outline-none focus:border-primary text-slate-800"
          />
          <button type="submit" className="bg-primary hover:bg-[#074739] text-white p-3 rounded-2xl transition">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

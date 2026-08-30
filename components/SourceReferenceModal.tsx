"use client";

import { useEffect } from "react";

export interface SourceReferenceDetails {
  title: string;
  organization?: string;
  date?: string;
  sourceUrl?: string | null;
  confidence?: string;
  notes?: string;
  metricsCovered?: string[];
}

interface SourceReferenceModalProps {
  details: SourceReferenceDetails | null;
  onClose: () => void;
}

export function SourceReferenceModal({ details, onClose }: SourceReferenceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (details) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [details, onClose]);

  if (!details) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl text-slate-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              DOCUMENT PROVENANCE & SOURCE CITATION
            </span>
            <h3 id="source-modal-title" className="text-base font-bold text-white mt-0.5 leading-snug">
              {details.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-xs">
          {details.organization && (
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Issuing Authority:</span>
              <span className="text-slate-100 font-medium text-right">{details.organization}</span>
            </div>
          )}

          {details.date && (
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Report Date / Version:</span>
              <span className="font-mono text-slate-200">{details.date}</span>
            </div>
          )}

          {details.confidence && (
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Verification Status:</span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[10px] font-mono text-slate-300 font-semibold">
                {details.confidence}
              </span>
            </div>
          )}

          {details.metricsCovered && details.metricsCovered.length > 0 && (
            <div className="border-b border-slate-800/80 pb-2 space-y-1">
              <span className="text-slate-400 block">Metrics Covered:</span>
              <div className="flex flex-wrap gap-1">
                {details.metricsCovered.map((m, i) => (
                  <span key={i} className="rounded bg-slate-950 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-800">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Graceful Fallback Notice */}
          <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs">
            <span className="text-slate-300 font-medium block">
              Reference Status: Source citation record
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {details.notes ??
                "This document is cataloged as an official disaster management reference. External state government servers (e.g. sdmas.assam.gov.in) may reside on official state intranets or require department credentials."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-750 transition"
          >
            Dismiss
          </button>

          {details.sourceUrl ? (
            <a
              href={details.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-slate-800 border border-slate-700 px-3 py-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-750 transition font-medium flex items-center gap-1.5"
            >
              <span>Attempt External Link</span>
              <span className="text-[10px]">↗</span>
            </a>
          ) : (
            <span className="text-slate-500 text-[11px]">No external URL required</span>
          )}
        </div>
      </div>
    </div>
  );
}

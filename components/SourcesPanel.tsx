"use client";

import { useState } from "react";
import type { SourcesRegistryData } from "@/lib/types";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";

interface SourcesPanelProps {
  sourcesData: SourcesRegistryData;
}

const confidenceBadge = {
  OFFICIAL: "bg-teal-950/60 text-teal-300 border-teal-800/80",
  "VERIFIED SECONDARY": "bg-sky-950/60 text-sky-300 border-sky-800/80",
  ESTIMATED: "bg-amber-950/60 text-amber-300 border-amber-800/80",
  PROTOTYPE: "bg-slate-800 text-slate-400 border-slate-700"
};

export function SourcesPanel({ sourcesData }: SourcesPanelProps) {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [activeSourceDetails, setActiveSourceDetails] = useState<SourceReferenceDetails | null>(null);

  const toggleSource = (id: string) => {
    setExpandedSourceId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-semibold text-white">
          Authoritative Sources & Data Confidence Taxonomy
        </h2>
        <p className="text-xs text-slate-400">
          Transparent operational distinction between official government situation bulletins, humanitarian planning factors, and modeled prototype estimates.
        </p>
      </div>

      {/* Confidence Taxonomy Reference Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="font-semibold text-white block">OFFICIAL</span>
          <p className="text-slate-300 font-medium">Government Bulletins</p>
          <p className="text-[11px] text-slate-500">ASDMA SitReps, Census of India, CWC Gauge Levels.</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="font-semibold text-white block">VERIFIED SECONDARY</span>
          <p className="text-slate-300 font-medium">Humanitarian Standards</p>
          <p className="text-[11px] text-slate-500">Sphere India WASH guidelines, NDMA camp norms.</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="font-semibold text-white block">ESTIMATED</span>
          <p className="text-slate-300 font-medium">Algorithmic Models</p>
          <p className="text-[11px] text-slate-500">Geodesic distance, RPS scores, capacity gaps.</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="font-semibold text-white block">PROTOTYPE</span>
          <p className="text-slate-300 font-medium">Simulated Safe Zones</p>
          <p className="text-[11px] text-slate-500">Modeled shelter coordinates created for spatial simulation.</p>
        </div>
      </div>

      {/* Compact Operational Table with Row-level Expansion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Official Source Records Registry
          </h3>
          <span className="text-xs text-slate-500">Click any row to inspect verification details</span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Data Title</th>
                <th className="p-3">Source Organization</th>
                <th className="p-3">Date</th>
                <th className="p-3">Confidence Tier</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {sourcesData.sources.map((src) => {
                const isExpanded = expandedSourceId === src.id;
                return (
                  <tr
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className="cursor-pointer hover:bg-slate-850/60 transition"
                  >
                    <td className="p-3">
                      <span className="font-medium text-white block">{src.title}</span>
                      {isExpanded && (
                        <div className="mt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-800 pt-2">
                          <p><b className="text-slate-300">Scope:</b> {src.notes}</p>
                          <p><b className="text-slate-300">Metrics:</b> {src.metrics_covered.join(" • ")}</p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSourceDetails({
                                  title: src.title,
                                  organization: src.organization,
                                  date: src.date,
                                  sourceUrl: src.source_url,
                                  confidence: src.confidence,
                                  notes: src.notes,
                                  metricsCovered: src.metrics_covered
                                });
                              }}
                              className="text-sky-400 hover:underline font-medium"
                            >
                              View Source Details Dialog ↗
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">{src.organization}</td>
                    <td className="p-3 font-mono text-slate-400">{src.date}</td>
                    <td className="p-3">
                      <span className={`rounded border px-2 py-0.5 text-[9px] font-medium font-mono ${confidenceBadge[src.confidence]}`}>
                        {src.confidence}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-slate-400">
                      {isExpanded ? "▲ Hide" : "▼ View"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable SourceReferenceModal */}
      <SourceReferenceModal
        details={activeSourceDetails}
        onClose={() => setActiveSourceDetails(null)}
      />
    </section>
  );
}

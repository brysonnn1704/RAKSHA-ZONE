"use client";

import { useState } from "react";
import type { SourcesRegistryData } from "@/lib/types";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";

interface SourcesPanelProps {
  sourcesData: SourcesRegistryData;
}

const confidenceBadge = {
  OFFICIAL: "bg-teal-50 text-teal-800 border-teal-200",
  "VERIFIED SECONDARY": "bg-sky-50 text-sky-800 border-sky-200",
  ESTIMATED: "bg-amber-50 text-amber-800 border-amber-200",
  PROTOTYPE: "bg-slate-100 text-slate-700 border-slate-300"
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
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-slate-900">
          Authoritative Sources & Data Confidence Taxonomy
        </h2>
        <p className="text-xs text-slate-600">
          Transparent operational distinction between official government situation bulletins, humanitarian planning factors, and modeled prototype estimates.
        </p>
      </div>

      {/* Confidence Taxonomy Reference Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">OFFICIAL</span>
          <p className="text-slate-700 font-medium">Government Bulletins</p>
          <p className="text-[11px] text-slate-500">ASDMA / NDRRMA SitReps, DHM / CWC River Telemetry, Census Data.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">VERIFIED SECONDARY</span>
          <p className="text-slate-700 font-medium">Humanitarian Standards</p>
          <p className="text-[11px] text-slate-500">Sphere India / Sphere Project WASH guidelines, NDMA camp norms.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">ESTIMATED</span>
          <p className="text-slate-700 font-medium">Algorithmic Models</p>
          <p className="text-[11px] text-slate-500">Geodesic distance, RPS priority scores, multi-factor suitability.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">PROTOTYPE</span>
          <p className="text-slate-700 font-medium">Simulated Safe Zones</p>
          <p className="text-[11px] text-slate-500">Modeled safe land coordinates created for spatial simulation testing.</p>
        </div>
      </div>

      {/* Compact Operational Table with Row-level Expansion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Official Source Records Registry
          </h3>
          <span className="text-xs text-slate-500">Click any row to inspect verification details</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Data Title</th>
                <th className="p-3">Source Organization</th>
                <th className="p-3">Date</th>
                <th className="p-3">Confidence Tier</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourcesData.sources.map((src) => {
                const isExpanded = expandedSourceId === src.id;
                return (
                  <tr
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className="cursor-pointer hover:bg-slate-50 transition"
                  >
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{src.title}</span>
                      {isExpanded && (
                        <div className="mt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2">
                          <p><b className="text-slate-800">Scope:</b> {src.notes}</p>
                          <p><b className="text-slate-800">Metrics:</b> {src.metrics_covered.join(" • ")}</p>
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
                              className="text-sky-700 hover:underline font-semibold"
                            >
                              View Source Details Dialog ↗
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">{src.organization}</td>
                    <td className="p-3 font-mono text-slate-600">{src.date}</td>
                    <td className="p-3">
                      <span className={`rounded border px-2 py-0.5 text-[9px] font-bold font-mono ${confidenceBadge[src.confidence]}`}>
                        {src.confidence}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-slate-500">
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

"use client";

import type { SourcesRegistryData } from "@/lib/types";

interface SourcesPanelProps {
  sourcesData: SourcesRegistryData;
}

const confidenceBadge = {
  OFFICIAL: "bg-teal-950/80 text-teal-300 border-teal-800",
  "VERIFIED SECONDARY": "bg-sky-950/80 text-sky-300 border-sky-800",
  ESTIMATED: "bg-amber-950/80 text-amber-300 border-amber-800",
  PROTOTYPE: "bg-slate-800 text-slate-300 border-slate-700"
};

export function SourcesPanel({ sourcesData }: SourcesPanelProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
          Data Provenance & Verification Registry
        </span>
        <h2 className="text-lg font-bold text-slate-100 mt-0.5">
          Authoritative Sources & Data Confidence Taxonomy
        </h2>
        <p className="text-xs text-slate-400">
          Transparent operational distinction between official government situation bulletins, humanitarian planning factors, and modeled prototype estimates.
        </p>
      </div>

      {/* Confidence Taxonomy Reference Card */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 text-xs">
        <div className="rounded border border-teal-800/80 bg-slate-850 p-3">
          <span className="rounded bg-teal-950 border border-teal-800 px-1.5 py-0.5 text-[9px] font-bold text-teal-300">
            OFFICIAL
          </span>
          <p className="mt-2 font-semibold text-slate-200">Government Bulletins</p>
          <p className="mt-1 text-[11px] text-slate-400">ASDMA SitReps, Census of India, CWC River Gauge Levels.</p>
        </div>

        <div className="rounded border border-sky-800/80 bg-slate-850 p-3">
          <span className="rounded bg-sky-950 border border-sky-800 px-1.5 py-0.5 text-[9px] font-bold text-sky-300">
            VERIFIED SECONDARY
          </span>
          <p className="mt-2 font-semibold text-slate-200">Humanitarian Standards</p>
          <p className="mt-1 text-[11px] text-slate-400">Sphere India WASH guidelines, NDMA camp management norms.</p>
        </div>

        <div className="rounded border border-amber-800/80 bg-slate-850 p-3">
          <span className="rounded bg-amber-950 border border-amber-800 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
            ESTIMATED
          </span>
          <p className="mt-2 font-semibold text-slate-200">Algorithmic Models</p>
          <p className="mt-1 text-[11px] text-slate-400">Geodesic distance, RPS priority scores, capacity deficit gaps.</p>
        </div>

        <div className="rounded border border-slate-700 bg-slate-850 p-3">
          <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
            PROTOTYPE
          </span>
          <p className="mt-2 font-semibold text-slate-200">Simulated Safe Zones</p>
          <p className="mt-1 text-[11px] text-slate-400">Modeled shelter coordinates created for spatial simulation.</p>
        </div>
      </div>

      {/* Source Records List */}
      <div className="space-y-3">
        {sourcesData.sources.map((src) => (
          <div key={src.id} className="rounded-md border border-slate-800 bg-slate-850 p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{src.title}</h3>
                <p className="text-xs text-slate-400">
                  {src.organization} · Date: <b className="text-slate-300 font-mono">{src.date}</b>
                </p>
              </div>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${confidenceBadge[src.confidence]}`}>
                {src.confidence}
              </span>
            </div>

            <div className="rounded bg-slate-900 p-2 text-xs text-slate-300 border border-slate-800">
              <span className="font-semibold text-slate-400">Metrics Covered: </span>
              {src.metrics_covered.join(" · ")}
            </div>

            <p className="text-xs text-slate-400">{src.notes}</p>

            {src.source_url && (
              <div className="pt-1 text-xs">
                <a
                  href={src.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  View Official Document / Data Portal →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

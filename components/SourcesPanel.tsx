"use client";

import type { SourcesRegistryData } from "@/lib/types";

interface SourcesPanelProps {
  sourcesData: SourcesRegistryData;
}

const confidenceBadge = {
  OFFICIAL: "bg-teal-950/80 text-teal-300 border-teal-700",
  "VERIFIED SECONDARY": "bg-sky-950/80 text-sky-300 border-sky-700",
  ESTIMATED: "bg-amber-950/80 text-amber-300 border-amber-700",
  PROTOTYPE: "bg-purple-950/80 text-purple-300 border-purple-700"
};

export function SourcesPanel({ sourcesData }: SourcesPanelProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
          Data Provenance & Verification Registry
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">
          Authoritative Sources & Data Confidence Ratings
        </h2>
        <p className="text-xs text-slate-400">
          Transparent distinction between official government data, standard humanitarian planning factors, and modeled prototype estimates.
        </p>
      </div>

      {/* Confidence Taxonomy Reference Card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-lg border border-teal-800 bg-teal-950/40 p-3">
          <span className="rounded bg-teal-900 border border-teal-600 px-2 py-0.5 text-[10px] font-bold text-teal-200">
            OFFICIAL
          </span>
          <p className="mt-2 font-semibold text-slate-200">Government Bulletins</p>
          <p className="mt-1 text-[11px] text-slate-400">ASDMA SitReps, Census of India, CWC River Gauge Levels.</p>
        </div>

        <div className="rounded-lg border border-sky-800 bg-sky-950/40 p-3">
          <span className="rounded bg-sky-900 border border-sky-600 px-2 py-0.5 text-[10px] font-bold text-sky-200">
            VERIFIED SECONDARY
          </span>
          <p className="mt-2 font-semibold text-slate-200">Humanitarian Standards</p>
          <p className="mt-1 text-[11px] text-slate-400">Sphere India WASH guidelines, NDMA camp management norms.</p>
        </div>

        <div className="rounded-lg border border-amber-800 bg-amber-950/40 p-3">
          <span className="rounded bg-amber-900 border border-amber-600 px-2 py-0.5 text-[10px] font-bold text-amber-200">
            ESTIMATED
          </span>
          <p className="mt-2 font-semibold text-slate-200">Algorithmic Models</p>
          <p className="mt-1 text-[11px] text-slate-400">Geodesic distance, RPS priority scores, capacity deficit gaps.</p>
        </div>

        <div className="rounded-lg border border-purple-800 bg-purple-950/40 p-3">
          <span className="rounded bg-purple-900 border border-purple-600 px-2 py-0.5 text-[10px] font-bold text-purple-200">
            PROTOTYPE
          </span>
          <p className="mt-2 font-semibold text-slate-200">Simulated Safe Zones</p>
          <p className="mt-1 text-[11px] text-slate-400">Modeled shelter coordinates created for algorithm simulation.</p>
        </div>
      </div>

      {/* Source Records List */}
      <div className="space-y-4">
        {sourcesData.sources.map((src) => (
          <div key={src.id} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{src.title}</h3>
                <p className="text-xs text-slate-400">
                  {src.organization} · Date: <b className="text-slate-300">{src.date}</b>
                </p>
              </div>
              <span className={`rounded border px-2.5 py-0.5 text-[10px] font-bold ${confidenceBadge[src.confidence]}`}>
                {src.confidence}
              </span>
            </div>

            <div className="rounded bg-slate-800/60 p-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Metrics Covered: </span>
              {src.metrics_covered.join(" · ")}
            </div>

            <p className="text-xs text-slate-400">{src.notes}</p>

            {src.source_url && (
              <div className="pt-2 text-xs">
                <a
                  href={src.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline hover:text-sky-300"
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

"use client";

import type { SmartRelocationOption, VillageAssessment, VillageFeature, WeightSet } from "@/lib/types";

interface SmartMatchingPanelProps {
  origins: VillageFeature[];
  selectedOriginId: string;
  onSelectOrigin: (id: string) => void;
  assessment: VillageAssessment;
  weights: WeightSet;
  onWeightsChange: (w: WeightSet) => void;
  region: "wayanad" | "assam";
}

const safetyBadge = {
  safe: "bg-emerald-950 text-emerald-300 border-emerald-800",
  moderate: "bg-amber-950 text-amber-300 border-amber-800",
  unsafe: "bg-red-950 text-red-300 border-red-800"
};

export function SmartMatchingPanel({
  origins,
  selectedOriginId,
  onSelectOrigin,
  assessment,
  weights,
  onWeightsChange,
  region
}: SmartMatchingPanelProps) {
  const isAssam = region === "assam";
  const priorityLabel = isAssam ? "Flood Relocation Priority Score" : "Relocation Priority Score";
  const options: SmartRelocationOption[] = assessment.smart_relocation_options ?? [];

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-5">
      {/* Header & Origin Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            {isAssam ? "Assam Multi-Criteria Shelter Allocation" : "Wayanad Zonal Shortlisting"}
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Relocation Site Matching & Headroom Ranking
          </h2>
          <p className="text-xs text-slate-400">
            Composite decision score balancing geodesic proximity, verified headroom, flood safety, and lifeline resource buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Inundated Settlement:</label>
          <select
            value={selectedOriginId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {origins.map((f) => (
              <option key={f.properties.id} value={f.properties.id}>
                {f.properties.name} {f.properties.district ? `(${f.properties.district})` : ""} — Pop: {f.properties.affected_population ?? f.properties.current_population}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Origin Assessment Summary Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded border border-slate-800 bg-slate-850 p-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Origin Habitation</span>
          <p className="font-semibold text-slate-100 text-sm mt-0.5">{assessment.name}</p>
          {assessment.district && <p className="text-[10px] text-slate-400">District: {assessment.district}</p>}
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">{priorityLabel}</span>
          <p className="font-bold text-sky-400 font-mono text-base mt-0.5">{assessment.rps.toFixed(3)}</p>
          <p className="text-[10px] text-slate-400">Tier: <b className="text-slate-200">{assessment.priority_tier}</b></p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Displaced Population</span>
          <p className="font-bold text-slate-100 font-mono text-base mt-0.5">
            {(assessment.affected_population ?? assessment.population).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">Target for shelter</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Hazard Susceptibility (HSS)</span>
          <p className="font-bold text-orange-400 font-mono text-base mt-0.5">{assessment.hss.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Stress Index: {assessment.stress_index.toFixed(2)}</p>
        </div>
      </div>

      {/* Top 3 Smart Matching Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Top 3 Recommended Safe Relocation Destinations
          </h3>
          <span className="text-[11px] text-slate-400">Ranked by composite suitability (0–1 scale)</span>
        </div>

        {options.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No candidate safe sites found within current range.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {options.map((opt, index) => {
              return (
                <div
                  key={opt.site_id}
                  className="rounded-md border border-slate-800 bg-slate-900 p-3.5 space-y-3 transition-colors duration-150 hover:border-sky-500/80 hover:bg-slate-850"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[9px] font-bold text-slate-300 font-mono">
                          RANK #{index + 1}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-sm font-bold text-slate-100 leading-snug">{opt.site_name}</h4>
                      {opt.district && (
                        <p className="text-[11px] text-slate-400">{opt.district} · {opt.type ?? "Shelter Hub"}</p>
                      )}
                    </div>
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase font-mono ${safetyBadge[opt.flood_safety]}`}>
                      {opt.flood_safety}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Geodesic Distance:</span>
                      <b className="font-mono text-slate-100">{opt.distance_km} km</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Available Safe Headroom:</span>
                      <b className="font-mono text-emerald-400">{opt.available_capacity.toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Resource Stock Buffer:</span>
                      <b className="font-mono text-sky-400">{opt.resource_coverage_pct}%</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Access Rating:</span>
                      <b className="font-mono text-slate-200">{((opt.accessibility_score ?? 0.85) * 100).toFixed(0)}%</b>
                    </div>
                    <div className="flex justify-between text-slate-200 font-semibold border-t border-slate-800 pt-1.5">
                      <span className="text-sky-400">Suitability Index:</span>
                      <span className="font-mono font-bold text-sky-300">{opt.suitability_score.toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="rounded bg-slate-950/70 p-2 text-[11px] text-slate-400 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">Evaluation: </span>
                    {opt.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Weight Sliders & Explainability Panel */}
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr] border-t border-slate-800 pt-4">
        {/* Dynamic Weight Sliders */}
        <div className="rounded border border-slate-800 bg-slate-850 p-3.5 space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Priority Weight Adjustment (RPS Formula)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Recalculates village prioritization tiers and rankings dynamically.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300">
                <span>α (Alpha) — Hazard Severity Weight:</span>
                <b className="text-sky-400 font-mono">{weights.alpha.toFixed(2)}</b>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.alpha}
                onChange={(e) => onWeightsChange({ ...weights, alpha: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>β (Beta) — Population Stress Weight:</span>
                <b className="text-sky-400 font-mono">{weights.beta.toFixed(2)}</b>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.beta}
                onChange={(e) => onWeightsChange({ ...weights, beta: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>γ (Gamma) — Socioeconomic Vulnerability Weight:</span>
                <b className="text-sky-400 font-mono">{weights.gamma.toFixed(2)}</b>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.gamma}
                onChange={(e) => onWeightsChange({ ...weights, gamma: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* Explainability Section */}
        <div className="rounded border border-slate-800 bg-slate-850 p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Scoring Rationale & Methodology
            </h4>
            <div className="mt-1.5 rounded bg-slate-900 p-2.5 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono text-[11px]">
              <div>RPS = (α × HSS) + (β × NormStress) + (γ × Vuln)</div>
              <div className="text-sky-300">
                = ({weights.alpha.toFixed(2)} × {assessment.hss.toFixed(2)}) + ({weights.beta.toFixed(2)} × {assessment.normalized_stress.toFixed(2)}) + ({weights.gamma.toFixed(2)} × {assessment.vulnerability_index.toFixed(2)})
              </div>
              <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1">
                = {assessment.rps.toFixed(3)} → Tier: {assessment.priority_tier}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              Suitability balances geodesic proximity against candidate safe headroom, road accessibility, and emergency relief buffers.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
            Provenance: Population sourced from <span className="text-slate-400 font-medium">{assessment.data_confidence ?? "OFFICIAL"}</span> records. Shelter hubs are modeled prototype clusters.
          </div>
        </div>
      </div>
    </section>
  );
}

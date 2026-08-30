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
  safe: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
  moderate: "bg-orange-950/80 text-orange-300 border-orange-700",
  unsafe: "bg-red-950/80 text-red-300 border-red-700"
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
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-6">
      {/* Header & Origin Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            {isAssam ? "Assam Flood Smart Matching" : "Wayanad Decision Support"}
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
            Relocation Recommendation & Multi-Criteria Ranking
          </h2>
          <p className="text-xs text-slate-400">
            Automated ranking matching displaced population to verified safe carrying capacity, proximity, and resource readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Select Inundated Settlement:</label>
          <select
            value={selectedOriginId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
          >
            {origins.map((f) => (
              <option key={f.properties.id} value={f.properties.id}>
                {f.properties.name} {f.properties.district ? `(${f.properties.district})` : ""} — Pop: {f.properties.affected_population ?? f.properties.current_population}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Origin Assessment Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-slate-800/60 p-3 border border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400">Origin Settlement</span>
          <p className="font-bold text-slate-100">{assessment.name}</p>
          {assessment.district && <p className="text-[10px] text-slate-400">District: {assessment.district}</p>}
        </div>
        <div>
          <span className="text-[11px] text-slate-400">{priorityLabel}</span>
          <p className="font-bold text-sky-300 font-mono text-lg">{assessment.rps.toFixed(3)}</p>
          <p className="text-[10px] text-slate-400">Tier: <b className="text-slate-200">{assessment.priority_tier}</b></p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400">Affected Population</span>
          <p className="font-bold text-slate-100 font-mono text-lg">
            {(assessment.affected_population ?? assessment.population).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">Displaced evacuees</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400">Hazard Susceptibility (HSS)</span>
          <p className="font-bold text-orange-300 font-mono text-lg">{assessment.hss.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Stress Index: {assessment.stress_index.toFixed(2)}</p>
        </div>
      </div>

      {/* Top 3 Smart Matching Cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
          <span>Top 3 Recommended Safe Relocation Destinations</span>
          <span className="text-xs font-normal text-slate-400">Sorted by Composite Suitability Score</span>
        </h3>

        {options.length === 0 ? (
          <p className="text-xs text-slate-400">No candidate relocation sites found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {options.map((opt, index) => {
              const rankColor =
                index === 0
                  ? "border-sky-500 bg-sky-950/30"
                  : index === 1
                  ? "border-slate-700 bg-slate-900/90"
                  : "border-slate-800 bg-slate-900/60";

              return (
                <div key={opt.site_id} className={`rounded-xl border p-4 transition ${rankColor}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-sky-500/20 border border-sky-400/40 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                        RANK #{index + 1}
                      </span>
                      <h4 className="mt-2 text-base font-bold text-slate-100">{opt.site_name}</h4>
                      {opt.district && <p className="text-xs text-slate-400">{opt.district} · {opt.type ?? "Shelter Hub"}</p>}
                    </div>
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${safetyBadge[opt.flood_safety]}`}>
                      {opt.flood_safety}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-slate-800/80 pt-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Geodesic Distance:</span>
                      <b className="font-mono text-slate-100">{opt.distance_km} km</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Available Safe Headroom:</span>
                      <b className="font-mono text-emerald-300">{opt.available_capacity.toLocaleString()} people</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Resource Buffer Coverage:</span>
                      <b className="font-mono text-sky-300">{opt.resource_coverage_pct}%</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Accessibility Rating:</span>
                      <b className="font-mono text-slate-200">{((opt.accessibility_score ?? 0.85) * 100).toFixed(0)}%</b>
                    </div>
                    <div className="flex justify-between text-slate-200 font-semibold border-t border-slate-800/80 pt-1.5">
                      <span className="text-sky-400">Composite Suitability:</span>
                      <span className="font-mono text-sm font-bold text-sky-300">{opt.suitability_score.toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded bg-slate-950/60 p-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Rationale: </span>
                    {opt.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Weight Sliders & Explainability Accordion */}
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] border-t border-slate-800 pt-4">
        {/* Dynamic Weight Sliders */}
        <div className="rounded-lg bg-slate-800/40 p-4 border border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Live RPS Weight Configuration
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            Adjusting weights immediately recalibrates priority scores and village tier assignments.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between">
                <span>α (Alpha) — Hazard Severity Weight:</span>
                <b className="text-sky-300 font-mono">{weights.alpha.toFixed(2)}</b>
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
              <div className="flex justify-between">
                <span>β (Beta) — Population Stress Weight:</span>
                <b className="text-sky-300 font-mono">{weights.beta.toFixed(2)}</b>
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
              <div className="flex justify-between">
                <span>γ (Gamma) — Socioeconomic Vulnerability Weight:</span>
                <b className="text-sky-300 font-mono">{weights.gamma.toFixed(2)}</b>
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

        {/* Explainability Accordion */}
        <div className="rounded-lg bg-slate-800/40 p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Why this ranking?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <b>{priorityLabel}</b> combines{" "}
              <span className="text-sky-300">{weights.alpha}×HSS ({assessment.hss.toFixed(2)})</span> +{" "}
              <span className="text-sky-300">{weights.beta}×normalized stress ({assessment.normalized_stress.toFixed(2)})</span> +{" "}
              <span className="text-sky-300">{weights.gamma}×vulnerability ({assessment.vulnerability_index.toFixed(2)})</span> ={" "}
              <b className="text-emerald-300">{assessment.rps.toFixed(3)}</b>.
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Candidate suitability balances geodesic proximity (Turf geodesic distance) against safe headroom, road accessibility, and emergency stock buffers.
            </p>
          </div>

          <div className="mt-3 rounded bg-slate-900 p-2 text-[10px] text-slate-400 border border-slate-700/50">
            <b>Confidence Note:</b> Population data is tagged <span className="text-teal-300 font-semibold">{assessment.data_confidence ?? "OFFICIAL"}</span>. Candidate sites are modeled prototype clusters requiring field DDMA clearance.
          </div>
        </div>
      </div>
    </section>
  );
}

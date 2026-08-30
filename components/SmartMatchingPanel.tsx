"use client";

import { useState } from "react";
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

export function SmartMatchingPanel({
  origins,
  selectedOriginId,
  onSelectOrigin,
  assessment,
  weights,
  onWeightsChange,
  region
}: SmartMatchingPanelProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const toggleCard = (siteId: string) => {
    setExpandedCards((prev) => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  const isAssam = region === "assam";
  const priorityLabel = isAssam ? "Flood Relocation Priority Score" : "Relocation Priority Score";
  const options: SmartRelocationOption[] = assessment.smart_relocation_options ?? [];

  return (
    <section className="space-y-6">
      {/* Header & Origin Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-semibold text-white">
            Relocation Site Matching & Headroom Ranking
          </h2>
          <p className="text-xs text-slate-400">
            Multi-criteria destination ranking balancing distance, safe headroom, flood risk, and relief buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Settlement:</label>
          <select
            value={selectedOriginId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 focus:border-slate-500 focus:outline-none"
          >
            {origins.map((f) => (
              <option key={f.properties.id} value={f.properties.id}>
                {f.properties.name} {f.properties.district ? `(${f.properties.district})` : ""} — Pop: {f.properties.affected_population ?? f.properties.current_population}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Origin Assessment Summary Strip - Uniform 4 cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Origin Habitation</span>
          <p className="font-semibold text-white text-base">{assessment.name}</p>
          {assessment.district && <span className="text-[11px] text-slate-500 block">{assessment.district}</span>}
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">{priorityLabel}</span>
          <p className="font-bold text-white font-mono text-base">{assessment.rps.toFixed(3)}</p>
          <span className="text-[11px] text-slate-500 block">Tier: <b className="text-slate-300">{assessment.priority_tier}</b></span>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Displacement Target</span>
          <p className="font-bold text-white font-mono text-base">
            {(assessment.affected_population ?? assessment.population).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 block">People requiring shelter</span>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3.5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Hazard Exposure (HSS)</span>
          <p className="font-bold text-white font-mono text-base">{assessment.hss.toFixed(2)}</p>
          <span className="text-[11px] text-slate-500 block">Stress Index: {assessment.stress_index.toFixed(2)}</span>
        </div>
      </div>

      {/* Top 3 Smart Matching Cards - Uniform, calm layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Top 3 Recommended Safe Relocation Destinations
          </h3>
          <span className="text-xs text-slate-500">Ranked by composite suitability (0–1 scale)</span>
        </div>

        {options.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No candidate safe sites found within current range.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {options.map((opt, index) => {
              const isExpanded = !!expandedCards[opt.site_id];

              return (
                <div
                  key={opt.site_id}
                  className="rounded border border-slate-800 bg-slate-900 p-4 space-y-3 transition-colors duration-150 hover:border-slate-700 hover:bg-slate-850/60 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                          RANK #{index + 1}
                        </span>
                        <h4 className="mt-0.5 text-sm font-semibold text-white">{opt.site_name}</h4>
                        {opt.district && (
                          <span className="text-xs text-slate-400 block">{opt.district} • {opt.type ?? "Shelter Hub"}</span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-200 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded">
                        {opt.suitability_score.toFixed(3)}
                      </span>
                    </div>

                    {/* Level 1 Core Metrics */}
                    <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2.5">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Distance:</span>
                        <b className="font-mono text-slate-100">{opt.distance_km} km</b>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Available Headroom:</span>
                        <b className="font-mono text-emerald-400">{opt.available_capacity.toLocaleString()} persons</b>
                      </div>
                    </div>

                    {/* Level 3 Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-2 text-xs border-t border-slate-800 pt-2.5">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Flood Safety:</span>
                          <span className="capitalize text-slate-200 font-mono text-xs">{opt.flood_safety}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Resource Stock Buffer:</span>
                          <span className="font-mono text-slate-200">{opt.resource_coverage_pct}% coverage</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Road Accessibility:</span>
                          <span className="font-mono text-slate-200">{((opt.accessibility_score ?? 0.85) * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                          <span className="text-slate-300 font-medium">Evaluation: </span>
                          {opt.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCard(opt.site_id)}
                    className="w-full pt-2.5 border-t border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition text-left flex items-center justify-between"
                  >
                    <span>{isExpanded ? "Hide details ▴" : "Evaluation details ▾"}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{isExpanded ? "▲" : "▼"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Weight Sliders & Explainability Panel */}
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr] border-t border-slate-800 pt-6">
        {/* Dynamic Weight Sliders */}
        <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Live Priority Weight Adjustment (RPS Parameters)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust weights in real-time to recompute habitation priorities.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300">
                <span>α (Alpha) — Hazard Severity:</span>
                <b className="font-mono text-slate-100">{weights.alpha.toFixed(2)}</b>
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
                <span>β (Beta) — Population Stress:</span>
                <b className="font-mono text-slate-100">{weights.beta.toFixed(2)}</b>
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
                <span>γ (Gamma) — Socioeconomic Vulnerability:</span>
                <b className="font-mono text-slate-100">{weights.gamma.toFixed(2)}</b>
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
        <div className="rounded border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Scoring Rationale & Breakdown
            </h4>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Hazard Contribution (α × HSS):</span>
                <b className="font-mono text-slate-100">{(weights.alpha * assessment.hss).toFixed(3)}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Stress Contribution (β × NormStress):</span>
                <b className="font-mono text-slate-100">{(weights.beta * assessment.normalized_stress).toFixed(3)}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Vulnerability (γ × Vuln):</span>
                <b className="font-mono text-slate-100">{(weights.gamma * assessment.vulnerability_index).toFixed(3)}</b>
              </div>
              <div className="flex justify-between text-white font-semibold border-t border-slate-800 pt-2 mt-1">
                <span>Final RPS Score:</span>
                <span className="font-mono">{assessment.rps.toFixed(3)} ({assessment.priority_tier} Tier)</span>
              </div>
            </div>

            {/* Expandable Formula */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                className="text-xs text-slate-400 hover:text-slate-200 transition font-medium flex items-center gap-1"
              >
                <span>{showCalculationDetails ? "Hide formula ▴" : "Show calculation formula ▾"}</span>
              </button>

              {showCalculationDetails && (
                <div className="mt-2 rounded bg-slate-950 p-2.5 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                  <div>RPS = (α × HSS) + (β × NormStress) + (γ × Vuln)</div>
                  <div>
                    = ({weights.alpha.toFixed(2)} × {assessment.hss.toFixed(2)}) + ({weights.beta.toFixed(2)} × {assessment.normalized_stress.toFixed(2)}) + ({weights.gamma.toFixed(2)} × {assessment.vulnerability_index.toFixed(2)})
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-2">
            Priority cutoffs: Immediate (&ge; 0.75), Short-term (0.50–0.74), Medium-term (&lt; 0.50).
          </div>
        </div>
      </div>
    </section>
  );
}

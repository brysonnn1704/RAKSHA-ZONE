"use client";

import { useState } from "react";

interface CascadeNode {
  step: number;
  stage: string;
  location: string;
  type: string;
  description: string;
  statusBadge: string;
  statusColor: string;
  propagationTime?: string;
  elevation?: string;
}

const CASCADE_STEPS: CascadeNode[] = [
  {
    step: 1,
    stage: "SOURCE HAZARD & MASS COLLAPSE",
    location: "Upper Lhende Basin Headwaters (Tibet / Nepal Border)",
    type: "Glacial Ice-Rock Failure",
    description: "High-altitude detachment of glacial ice and bedrock mass from steep north-facing headwall. Volume estimated in millions of cubic meters.",
    statusBadge: "Physical Trigger (Under Investigation)",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    elevation: "5,800m → 4,200m"
  },
  {
    step: 2,
    stage: "UPPER GORGE CHANNELING & SCOURING",
    location: "Lhende Khola Gorge",
    type: "Hyperconcentrated Debris Flow",
    description: "Mass pulverization into saturated slurry; high kinetic energy gouging unstable moraine sediment along narrow canyon walls.",
    statusBadge: "High Velocity Surge",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    propagationTime: "+15 mins",
    elevation: "3,200m"
  },
  {
    step: 3,
    stage: "TEMPORARY DEBRIS DAMMING & BREACH",
    location: "Lhende–Bhote Koshi Confluence (Gyirong Port Sector)",
    type: "Channel Blockade & Outburst Wave",
    description: "Sediment choking across narrow river constriction created short-lived backwater reservoir, followed by rapid overtopping and erosive dam breach.",
    statusBadge: "Surge Amplification",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    propagationTime: "+35 mins",
    elevation: "2,750m"
  },
  {
    step: 4,
    stage: "CROSS-BORDER VALLEY INUNDATION",
    location: "Timure Customs Post & Rasuwagadhi Border (Nepal)",
    type: "Critical Infrastructure Washout",
    description: "Severe bank erosion, Pasang Lhamu Highway (NH-03) severed, customs yards inundated, headworks of 111 MW Rasuwagadhi damaged.",
    statusBadge: "Immediate Priority",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+60 mins",
    elevation: "1,780m"
  },
  {
    step: 5,
    stage: "TRIBUTARY CONFLUENCE BACKWATER",
    location: "Syapru Besi (Langtang Khola & Bhote Koshi Confluence)",
    type: "Major Settlement Inundation",
    description: "Langtang tributary flow backed up by surging mainstem; low-lying market stalls and tourist bridges washed away; local evacuations triggered.",
    statusBadge: "Active Evacuation",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+90 mins",
    elevation: "1,460m"
  },
  {
    step: 6,
    stage: "DOWNSTREAM TRISHULI RIVER FLOODING",
    location: "Betrawati, Bidur (Nuwakot) & Galchhi (Dhading)",
    type: "Agricultural Terrace Inundation & Silt Deposition",
    description: "Flood hydrograph broadens into lower valley basin; flood warnings transmitted via DHM telemetry; silt clearance underway at hydropower barrages.",
    statusBadge: "Downstream Watch",
    statusColor: "bg-sky-50 text-sky-700 border-sky-200",
    propagationTime: "+3.5 to 5 hrs",
    elevation: "580m → 390m"
  },
  {
    step: 7,
    stage: "RELOCATION & HIGHLAND ALLOCATION",
    location: "Dhunche, Battar Terrace, Galchhi & Gyirong Safe Hubs",
    type: "Multi-Criteria Safe Evacuation Matching",
    description: "Automated RAKSHA-ZONE matching directs displaced populations away from active valley bottoms to designated stable alluvial terraces and safe ridge camps.",
    statusBadge: "Safe Relocation Plan",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    elevation: "Elevated Safe Zones"
  }
];

export function NepalCascadePanel() {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const activeNode = CASCADE_STEPS.find((s) => s.step === selectedStep) ?? CASCADE_STEPS[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header with collapsible toggle */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200">
              CASCADING HAZARD ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">26 Aug 2026 Event</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Himalayan Hazard Cascade Vector: Glacial Detachment → Trishuli Surge
          </h2>
          <p className="text-xs text-slate-600">
            Multi-stage spatial propagation model tracing the initiation, channel blockades, river surge, and safe highland relocation corridors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          {isExpanded ? "Collapse Cascade ▲" : "Expand Cascade ▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-5">
          {/* Visual Step-by-Step Chain */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {CASCADE_STEPS.map((node) => {
              const isSelected = node.step === selectedStep;
              return (
                <button
                  key={node.step}
                  type="button"
                  onClick={() => setSelectedStep(node.step)}
                  className={`p-3 rounded-lg border text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-400/50"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`font-bold ${isSelected ? "text-sky-800" : "text-slate-500"}`}>
                        STEP {node.step}
                      </span>
                      {node.elevation && (
                        <span className="text-slate-500">{node.elevation}</span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isSelected ? "text-sky-950" : "text-slate-800"}`}>
                      {node.location}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/70">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium border ${node.statusColor}`}>
                      {node.type.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Step Card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 text-white w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
                  {activeNode.step}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                    {activeNode.stage}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{activeNode.location}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeNode.propagationTime && (
                  <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Propagation: {activeNode.propagationTime}
                  </span>
                )}
                <span className={`rounded border px-2 py-0.5 text-xs font-medium ${activeNode.statusColor}`}>
                  {activeNode.statusBadge}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-xs">
              <div className="md:col-span-2 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Physical Mechanism & Impact
                </span>
                <p className="text-slate-700 leading-relaxed text-[13px]">{activeNode.description}</p>
              </div>

              <div className="rounded bg-white p-3 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Operational Implication
                </span>
                <p className="text-slate-800 font-medium leading-normal">
                  {activeNode.step <= 3
                    ? "Upstream telemetry and cross-border seismic/radar triggers required for early valley evacuation."
                    : activeNode.step <= 5
                    ? "Immediate transport corridor isolation and evacuation of riverbed settlements to designated safe high ground."
                    : "Macro-basin resource dispatch and multi-stage safe carrying capacity matching."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

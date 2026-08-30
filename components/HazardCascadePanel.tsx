"use client";

import { useState } from "react";
import type { RegionId } from "@/lib/types";

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

const NEPAL_CASCADE_STEPS: CascadeNode[] = [
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

const ASSAM_CASCADE_STEPS: CascadeNode[] = [
  {
    step: 1,
    stage: "UPSTREAM MONSOON SURGE INITIATION",
    location: "Upper Brahmaputra & Subansiri / Siang Catchments",
    type: "Excess Monsoon Deposition",
    description: "Continuous heavy rainfall over upper catchment areas leading to extreme runoff volume entering the Assam valley.",
    statusBadge: "Hydrological Trigger",
    statusColor: "bg-sky-50 text-sky-700 border-sky-200",
    elevation: "Upper Catchment"
  },
  {
    step: 2,
    stage: "TRIBUTARY SWELLING & DANGER LEVEL BREACH",
    location: "Brahmaputra, Dhansiri, Jia Bharali & Kopili Rivers",
    type: "Mainstem Channel Saturation",
    description: "Multiple tributaries cross warning and danger levels concurrently (e.g. Kopili at Kampur +1.45m above danger level).",
    statusBadge: "Critical River Level",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    propagationTime: "+6 to 12 hrs"
  },
  {
    step: 3,
    stage: "EMBANKMENT SCOUR & LEVEE BREACH",
    location: "Nagaon, Morigaon & Golaghat Embankment Sectors",
    type: "Structural Earthen Breach",
    description: "High hydrodynamic pressure scours earthen river bunds, causing rapid breach and sudden overland flooding into agricultural mouzas.",
    statusBadge: "Breach Inundation",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+18 hrs"
  },
  {
    step: 4,
    stage: "POPULATION ISOLATION & CROP FLOODING",
    location: "Kaliabor, Dhing, Raha & Bokakhat Mouzas",
    type: "Habitation & Livelihood Exposure",
    description: "Extensive flooding across hundreds of revenue villages; over 160,000 hectares of cropland inundated; road connectivity severed.",
    statusBadge: "Immediate Priority",
    statusColor: "bg-red-50 text-red-700 border-red-200"
  },
  {
    step: 5,
    stage: "HIGHLAND RELOCATION & SAFE SHELTER",
    location: "Tezpur University Ridge, Diphu Safe Ground, Nagaon High School",
    type: "Safe Headroom Matching",
    description: "Displaced populations allocated to safe non-flooded highlands and permanent campus relief centers.",
    statusBadge: "Relocation Optimal",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
];

const WAYANAD_CASCADE_STEPS: CascadeNode[] = [
  {
    step: 1,
    stage: "INTENSE CLOUDBURST / PRECIPITATION",
    location: "Vellarimala Hills Crest (Western Ghats)",
    type: "Extreme Hydro-Meteorological Trigger",
    description: "Over 500mm of localized torrential rain within 48 hours supersaturates steep hillside regolith above 1,800m elevation.",
    statusBadge: "Primary Trigger",
    statusColor: "bg-sky-50 text-sky-700 border-sky-200",
    elevation: "1,850m"
  },
  {
    step: 2,
    stage: "UPPER SLOPE DEBRIS DETACHMENT",
    location: "Punchirimattom Crown Slope",
    type: "High-Velocity Saturated Landslide",
    description: "Pore pressure failure triggers sudden collapse of rock, mud, and forest vegetation down the steep canyon.",
    statusBadge: "High Velocity Flow",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+5 mins",
    elevation: "1,450m"
  },
  {
    step: 3,
    stage: "MID-STREAM CHANNELING & DEBRIS SURGE",
    location: "Mundakkai Settlement & Stream Corridor",
    type: "Hyperconcentrated Mudflow & Boulders",
    description: "Debris torrent obliterates streamside tea estate housing and shops; heavy boulder deposition.",
    statusBadge: "Immediate Priority",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+15 mins",
    elevation: "980m"
  },
  {
    step: 4,
    stage: "CRITICAL INFRASTRUCTURE DESTRUCTION",
    location: "Chooralmala Bridge & Town Center",
    type: "Bridge Collapse & Road Severance",
    description: "Main bridge spanning the Iruvanjippuzha washed away; rescue access severed; valley bottom engulfed in mud deposits.",
    statusBadge: "Critical Washout",
    statusColor: "bg-red-50 text-red-700 border-red-200",
    propagationTime: "+30 mins",
    elevation: "780m"
  },
  {
    step: 5,
    stage: "SAFE STAGING & PERMANENT RELOCATION",
    location: "Meppadi High Ridge, Kalpetta Community Safe Site",
    type: "Safe Carrying Capacity Relocation",
    description: "Displaced survivors evacuated to stable elevated school campuses and designated safe carrying capacity zones.",
    statusBadge: "Relocation Staging",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    elevation: "Stable Elevated Land"
  }
];

export function HazardCascadePanel({ region }: { region: RegionId }) {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps =
    region === "nepal"
      ? NEPAL_CASCADE_STEPS
      : region === "assam"
      ? ASSAM_CASCADE_STEPS
      : WAYANAD_CASCADE_STEPS;

  const activeNode = steps.find((s) => s.step === selectedStep) ?? steps[0];

  const scenarioTitle =
    region === "nepal"
      ? "Nepal–Tibet Himalayan Hazard Cascade: Glacier Detachment → Trishuli Surge"
      : region === "assam"
      ? "Brahmaputra Riverine Basin Hazard Cascade: Tributary Surge → Embankment Breach"
      : "Wayanad Western Ghats Hazard Cascade: Intense Rain → Saturated Debris Flow";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200">
              CASCADING HAZARD ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {region === "nepal" ? "26 Aug 2026 Event" : region === "assam" ? "Monsoon Wave 2026" : "July 2024 Event"}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            {scenarioTitle}
          </h2>
          <p className="text-xs text-slate-600">
            Multi-stage spatial propagation model tracing the initiation, channel bottlenecks, impact propagation, and safe highland relocation corridors.
          </p>
        </div>
      </div>

      {/* Step-by-Step Selection Chain */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {steps.map((node) => {
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
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 text-white w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
              {activeNode.step}
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                {activeNode.stage}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{activeNode.location}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeNode.propagationTime && (
              <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                Propagation: {activeNode.propagationTime}
              </span>
            )}
            <span className={`rounded border px-2 py-0.5 text-xs font-bold ${activeNode.statusColor}`}>
              {activeNode.statusBadge}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-xs">
          <div className="md:col-span-2 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">
              Physical Mechanism & Environmental Impact
            </span>
            <p className="text-slate-700 leading-relaxed text-[13px] font-medium">{activeNode.description}</p>
          </div>

          <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">
              Operational Decision Implication
            </span>
            <p className="text-slate-800 font-medium leading-normal">
              {activeNode.step <= 2
                ? "Early sensor detection and automated warning transmission to vulnerable riverine settlements."
                : activeNode.step <= 4
                ? "Immediate transport corridor isolation, vehicular evacuation routing, and life-safety containment."
                : "Multi-criteria destination carrying capacity matching, resource buffer mobilization, and permanent relocation planning."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

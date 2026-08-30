"use client";

import type { RegionId } from "@/lib/types";

export type DashboardTab =
  | "overview"
  | "risk_map"
  | "capacity"
  | "relocation"
  | "resources"
  | "cascade"
  | "weights"
  | "timeline"
  | "sources";

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  region: RegionId;
  onSelectRegion: (region: RegionId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  category?: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Command Center", icon: "▦", badge: "Live" },
  { id: "risk_map", label: "Hazard Map", icon: "◫" },
  { id: "capacity", label: "Population Risk", icon: "👥" },
  { id: "relocation", label: "Relocation Planning", icon: "➤" },
  { id: "resources", label: "Relief Resources", icon: "◈" },
  { id: "cascade", label: "Hazard Cascade", icon: "⚡" },
  { id: "weights", label: "Scenario Simulator", icon: "⚗" },
  { id: "timeline", label: "Situation Timeline", icon: "⏱" },
  { id: "sources", label: "Data Provenance", icon: "📋" }
];

export function Sidebar({
  activeTab,
  onSelectTab,
  region,
  onSelectRegion,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-sky-600 font-bold text-white text-xs">
                R
              </span>
              <h1 className="text-base font-black tracking-tight text-slate-900">
                RAKSHA-ZONE
              </h1>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              SIH26191 • SDMA DSS
            </p>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 text-slate-400 hover:text-slate-700 md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Region / Scenario Selector Dropdown */}
        <div className="border-b border-slate-200 p-3 bg-slate-50/70">
          <label htmlFor="sidebar-region-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Active Scenario
          </label>
          <select
            id="sidebar-region-select"
            value={region}
            onChange={(e) => {
              onSelectRegion(e.target.value as RegionId);
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="wayanad">Wayanad, Kerala (Landslide)</option>
            <option value="assam">Assam (Monsoon Flood)</option>
            <option value="nepal">Nepal–Tibet (Himalayan Flood)</option>
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operational Navigation
          </p>

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "border-l-4 border-sky-600 bg-sky-50 text-sky-950 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-sm ${isActive ? "text-sky-700" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 uppercase font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer — Status & Quick Links */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/60 space-y-2 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Offline Engine</span>
            </span>
            <span className="font-mono text-[10px]">v2.3.0 Light</span>
          </div>

          <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-xs">
            <a href="/capacity" className="text-slate-600 hover:text-sky-700">Capacity Deep Dive →</a>
          </div>
        </div>
      </aside>
    </>
  );
}

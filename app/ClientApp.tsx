"use client";
import dynamic from "next/dynamic";
const Dashboard = dynamic(() => import("@/components/Dashboard").then((module) => module.Dashboard), { ssr: false, loading: () => <main className="min-h-screen bg-[#07111f] p-8 text-slate-200">Loading RAKSHA-ZONE…</main> });
export default function ClientApp() { return <Dashboard />; }

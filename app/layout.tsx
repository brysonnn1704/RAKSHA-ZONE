import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "RAKSHA-ZONE | SDMA Decision Support", description: "Multi-hazard red-zone and relocation planning for Wayanad" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

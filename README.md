# RAKSHA-ZONE | Multi-Hazard Relocation & Resource Planning Platform

GIS decision-support platform for SIH26191 (Ministry of Home Affairs / NDRF Disaster Management Division): identify multi-hazard red zones, measure relocation-site safe carrying capacity, perform smart shelter matching, and model emergency lifeline resource requirements.

## Demonstration Regions

RAKSHA-ZONE supports multiple hazard regimes across Indian states through a unified, region-agnostic decision engine:

1. **Wayanad, Kerala (Mountain Landslide & Flash Flood)**:
   - High-relief terrain focused on localized debris flow risks, slope vulnerability, and candidate town safe headroom in Meppadi, Vythiri, and Kalpetta.
2. **Assam (Monsoon Riverine Flood & Brahmaputra Basin Inundation)**:
   - Wide-area seasonal riverine displacement across 13 priority flood-affected districts (Nagaon, Golaghat, Jorhat, Sivasagar, Dhemaji, Sonitpur, Lakhimpur, Darrang, Biswanath, Hojai, Udalguri, Charaideo, Kamrup Metro).

---

## Why Assam?

Assam demonstrates RAKSHA-ZONE's architectural scalability beyond mountain landslides into large-scale riverine monsoon flooding. 

- **Wayanad**: Landslide hazard zonation + village carrying capacity + localized relocation matching.
- **Assam**: Large-scale flood displacement + multi-district relief shelter capacity + commodity logistics (water, food, medical teams, sanitation).

### Core Platform USP
> **"RAKSHA-ZONE does not merely show where a disaster is occurring. It connects hazard exposure with people, safe carrying capacity and resource availability to answer the operational question: WHERE should vulnerable populations go, HOW MANY can each site safely accommodate, and WHAT resources are still missing?"**

---

## Quick Start (Run Locally)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

- `npm test` runs unit tests for flood & landslide scoring formulas, carrying capacity calculations, resource statuses, and smart matching.
- `npm run build` performs full static page compilation and type checking.

---

## Architecture & Data Flow

```
data/
├── villages.geojson                  (Wayanad baseline dataset)
├── SOURCES.md                        (Wayanad provenance)
└── assam/
    ├── villages.geojson              (Assam flood origin settlements)
    ├── relocation_sites.geojson      (Candidate relief shelter complexes)
    ├── resources.json                (Site-by-site material and logistics stock tracking)
    ├── flood_statistics.json         (ASDMA situation snapshots & timeline)
    ├── sources.json                  (Granular source records with URLs)
    └── SOURCES.md                    (Assam documentation & data provenance)

lib/
├── data.ts                           (Multi-region dataset loader)
├── scoring.ts                        (Flood-specific HSS + Smart Relocation Matching)
├── capacity.ts                       (Carrying capacity & Capacity Gap Analysis)
├── resources.ts                      (Commodity coverage & Model-Derived Action List)
├── resourceConfig.ts                 (Sphere standards & status thresholds)
└── planning.ts                       (Multi-region allocation & route vectors)
```

---

## Data Confidence Taxonomy

To maintain rigor and prevent unsupported claims, all data in RAKSHA-ZONE is categorized into 4 confidence tiers:
1. `OFFICIAL`: Sourced directly from government disaster management bulletins (ASDMA SitReps, Census of India, CWC river gauge data).
2. `VERIFIED SECONDARY`: Standard humanitarian planning norms (Sphere India standards, NDMA shelter guidelines).
3. `ESTIMATED`: Algorithmically derived metrics (geodesic distance matrices, RPS scores, capacity deficit gaps).
4. `PROTOTYPE`: Simulated safe zone complexes created for spatial prototyping.

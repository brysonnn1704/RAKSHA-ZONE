# Data Sources & Methodology: Assam Flood Relocation Module

## 1. Overview & Provenance Standard

The Assam module demonstrates RAKSHA-ZONE's capacity to scale from localized mountain landslide/debris flows (Wayanad) to wide-area monsoon riverine flood displacement (Brahmaputra & Barak basins).

To maintain credibility and avoid unsupported claims:
- **Macro Displacement & District Impact**: Sourced from official situation bulletins of the **Assam State Disaster Management Authority (ASDMA)** (August 2026 snapshot).
- **River Gauge & Flood Levels**: Sourced from **Central Water Commission (CWC)** daily hydrological bulletins.
- **Humanitarian Resource Benchmarks**: Sourced from **Sphere India / NDMA** emergency response guidelines.
- **Relocation Sites & Resource Stocks**: Modeled **prototype safe zone complexes** representing schools, sports complexes, permanent highlands, and multi-purpose cyclone/flood shelters.

> **Operational Disclaimer**:
> Prototype planning data — not an official government evacuation order. All site capacities and resource inventories require ground verification by DDMA / Revenue & Disaster Management officials before operational execution.

---

## 2. Source Classification & Confidence Levels

| Level | Tag | Meaning | Examples in Assam Module |
|---|---|---|---|
| 1 | `OFFICIAL` | Direct government situation reports, official census data, CWC hydro bulletins | Affected population (155,849), village counts, district breakdowns |
| 2 | `VERIFIED SECONDARY` | Official planning norms, standard humanitarian guidelines, DDMP documents | Sphere resource factors (50L water/person/day, 5 persons/shelter) |
| 3 | `ESTIMATED` | Model-derived calculations (e.g. SCC, capacity gaps, distance matrices) | Smart relocation suitability scores, capacity deficits |
| 4 | `PROTOTYPE` | Demo coordinates and simulated capacity caps for spatial prototyping | Candidate site centroid polygons and hypothetical camp caches |

---

## 3. Calculation Formulas

### Hazard Susceptibility Score (HSS) - Flood Specific
For flood scenarios:
$$\text{HSS} = \text{HAZARD\_SCORE}[\text{flood\_hazard\_class}]$$
Where:
- `very_high` = 1.00
- `high` = 0.75
- `moderate` = 0.40
- `low` = 0.15

### Safe Carrying Capacity (SCC)
$$\text{SCC} = \text{safe\_land\_area\_hectares} \times \text{max\_safe\_density\_per\_hectare} \times \text{resource\_multiplier}$$

### Available Capacity
$$\text{Available Capacity} = \max(0, \text{SCC} - \text{current\_occupancy})$$

### Relocation Priority Score (RPS)
$$\text{RPS} = \alpha \times \text{HSS} + \beta \times \text{Normalized Stress} + \gamma \times \text{Vulnerability Index}$$
*Default weights: $\alpha = 0.5$, $\beta = 0.3$, $\gamma = 0.2$ (live adjustable in dashboard).*

### Smart Composite Relocation Suitability
$$\text{Suitability} = 0.25 \times S_{\text{dist}} + 0.25 \times S_{\text{cap}} + 0.20 \times S_{\text{res}} + 0.15 \times S_{\text{safe}} + 0.15 \times S_{\text{access}}$$

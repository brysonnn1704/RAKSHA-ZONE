# Data Sources & Methodology: Nepal–Tibet Cascading Himalayan Hazard Module

## 1. Context & Scientific Purpose

The Nepal–Tibet module extends the RAKSHA-ZONE decision-support architecture to multi-hazard Himalayan environments characterized by steep topography, cross-border headwaters, and rapid hazard cascade propagation.

On **26 August 2026**, a high-altitude mass movement occurred in the upper Lhende River basin near the Nepal–Tibet border. The event triggered rapid debris blocking and downstream flash flooding along the **Lhende Khola $\rightarrow$ Bhote Koshi $\rightarrow$ Trishuli River** corridor across Rasuwa, Nuwakot, and Dhading districts of Nepal, with impacts also reported in Gyirong County on the Tibet side.

> [!NOTE]
> **Research & Demonstration Scenario**:
> This module is created for multi-hazard spatial modeling and decision-support simulation. It does not constitute an operational government early warning notification. All operational evacuation orders remain under the sole jurisdiction of the National Disaster Risk Reduction and Management Authority (NDRRMA) of Nepal and regional authorities.

---

## 2. Physical Trigger & Uncertainty Classification

Because the exact physical trigger is subject to ongoing multi-agency field investigation and high-resolution satellite remote sensing analysis, RAKSHA-ZONE adopts the following transparent classification:

| Hazard Component | Classification | Current Scientific Status |
|---|---|---|
| **Primary Trigger** | Landslide / Ice-Rock Mass Collapse | Confirmed high-altitude failure in upper basin |
| **Secondary Propagation** | Debris Dam Breach / Hyperconcentrated Flash Flood | Confirmed river surge down Bhote Koshi & Trishuli |
| **Potential Component** | Glacial Lake Outburst Flood (GLOF) | **Under investigation** (no definitive proglacial breach confirmed) |

---

## 3. Authoritative Multi-Agency Sources

1. **Nepal Red Cross Society (NRCS)**: Initial emergency field situation bulletins detailing displaced households and relief distribution hubs in Rasuwa District.
2. **National Disaster Risk Reduction and Management Authority (NDRRMA), Nepal**: Daily disaster situation reports, damage assessments on the Pasang Lhamu Highway (NH-03), and missing/casualty reporting.
3. **Department of Hydrology and Meteorology (DHM), Government of Nepal**: Hydrological bulletins for the Trishuli River basin, river gauge telemetry at Betrawati, and flood velocity warnings.
4. **USGS / European Geosciences Union (EGU)**: Cryosphere and geomorphological satellite monitoring archives for high-altitude mass wasting analysis.
5. **International Humanitarian Standards (Sphere Project / NDMA Guidelines)**: Humanitarian benchmarks for emergency water ($50\,\text{L}/\text{person}/\text{day}$), emergency shelter ($5\,\text{persons}/\text{unit}$), latrine coverage ($20\,\text{persons}/\text{unit}$), and medical deployment norms.

---

## 4. Confidence & Provenance Taxonomy

- `OFFICIAL`: Verified government hydrological bulletins and official disaster management sitreps (e.g. DHM river gauges, NDRRMA highway status).
- `VERIFIED SECONDARY`: Standard humanitarian planning factors (Sphere India / Sphere Project WASH parameters).
- `ESTIMATED`: Algorithmically computed Relocation Priority Scores (RPS), stress indices, and distance matrices.
- `PROTOTYPE`: Simulated high-ground evacuation staging coordinates created for decision-support algorithm testing.

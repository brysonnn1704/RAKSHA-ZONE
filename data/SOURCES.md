# Source and assumption ledger

## Dataset scope

`villages.geojson` deliberately contains only the nine named origin/at-risk locations and three named relocation candidates requested for this MVP. Its geometry is point-centroid seed geometry—not official administrative boundaries—and must not be used for routing, notification, acquisition, or relocation orders.

The population, safe-land area, density, and vulnerability values are **transparent prototype planning inputs**, not claimed census counts, land-survey results, or official carrying-capacity approvals. They exist so the scoring and explainability paths are demonstrable. Replace them with SDMA-approved survey, land-use, infrastructure, and Census data before operational use.

## Hazard-method reference

- [NDMA National Disaster Management Guidelines: Management of Landslides and Snow Avalanches](https://nidm.gov.in/PDF/pubs/NDMA/7.pdf) — basis for using zonation classes in a planning workflow.
- [NIDM / NDMA landslide guidance landing material](https://nidm.gov.in/PDF/pubs/NDMA/7.pdf) — reference standard for the defensible class mapping. RAKSHA-ZONE maps very high/high/moderate/low to 1.00/0.75/0.40/0.15 exactly as specified in the brief; it does not claim this is an official numeric NDMA scale.

## Wayanad context

- [NDRF operation record](https://ndrf.gov.in/en/operations/landslide-wayanad-kerala) documents the 30 July 2024 disaster at Mundakkai, Chooralmala and nearby locations.
- [Kerala SDMA 2024 landslide reports index](https://sdma.kerala.gov.in/reports-landslides-2024/) is the primary starting point for reports and official post-disaster materials.
- [Sphere India preliminary assessment](https://www.sphereindia.org.in/sites/default/files/2024-08/Wayanad%20Preliminary%20Assessment%20Report%20Aug%202024.pdf) provides contextual reporting on affected estate communities. It is not used as a source for the seed numeric inputs.

## Integration references

- Bhuvan WMS: `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms` — queried with `GetCapabilities` at runtime; no known layer name is baked into the app.
- Bhuvan REST and data.gov.in are optional, token-gated enrichment paths. Credentials are environment variables only and are never committed.

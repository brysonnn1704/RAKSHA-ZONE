# Changelog — RAKSHA-ZONE

## [2.2.0] - 2026-08-30

### Fixed & Enhanced
- **Graceful Document Reference Citations**:
  - Replaced all raw external government URL links across Timeline, Overview, and Provenance with the reusable `SourceReferenceModal` component.
  - Clicking any document citation (e.g. `ASDMA Daily Situation Report (08 Aug 2026)`) now opens a graceful citation preview dialog showing issuing authority, date, verification status (`OFFICIAL`), and archival notices, preventing `DNS_PROBE_POSSIBLE` browser error pages.
- **Operational Overview Layout & Hierarchy**:
  - Repositioned the two dense accordions (`Situation details` and `Impact & capacity details`) to the bottom of the page, below the primary decision-level content (KPI cards, Map, and Selected Habitation Profile).
  - Both accordions remain collapsed by default with full keyboard (`Enter`/`Space`), touch, and mouse accessibility.
- **Codebase Deduplication Pass**:
  - Extracted unified `mapAndProfileView` in `components/Dashboard.tsx` to eliminate redundant duplicated Map/Habitation Profile JSX between Assam and Wayanad branches.
  - Consolidated all source document reference triggers onto the unified `SourceReferenceModal` pattern.

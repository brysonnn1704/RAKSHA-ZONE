declare module "*.geojson" {
  const value: { type: string; metadata?: Record<string, unknown>; features: unknown[] };
  export default value;
}

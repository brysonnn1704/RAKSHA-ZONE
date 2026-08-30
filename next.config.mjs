/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["@turf/turf"] },
  webpack(config) {
    config.module.rules.push({ test: /\.geojson$/, type: "json" });
    return config;
  }
};
export default nextConfig;

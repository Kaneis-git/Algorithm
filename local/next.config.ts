import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle only the Node.js files needed by the production server.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;

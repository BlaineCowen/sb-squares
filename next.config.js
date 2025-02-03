module.exports = {
  output: "standalone", // Reduces lambda size
  images: {
    domains: ["a.espncdn.com"], // Optimize image caching
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"], // Reduce bundle size
  },
  productionBrowserSourceMaps: true, // For production debugging
  webpack: (config, { isServer }) => {
    config.devtool = isServer ? false : "eval-source-map";
    config.optimization.minimize = false;
    return config;
  },
  optimizeFonts: false,
  optimizeImages: false,
  optimizeCss: false,
  experimental: {
    esmExternals: false,
    swcMinify: false,
    swcFileReading: false,
  },
};

module.exports = {
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

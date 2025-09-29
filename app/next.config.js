const path = require('path');

const repositoryName = 'conveyx-training-game';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGitHubPages ? `/${repositoryName}` : '');
const configuredAssetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || (configuredBasePath ? configuredBasePath : '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE || 'export',
  ...(configuredBasePath ? { basePath: configuredBasePath } : {}),
  ...(configuredAssetPrefix ? { assetPrefix: configuredAssetPrefix } : {}),
  trailingSlash: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repoName = 'mathcarecenter';

const nextConfig = {
  // If building on GitHub Actions for GitHub Pages, set the basePath
  basePath: isGithubActions ? `/${repoName}` : '',
  assetPrefix: isGithubActions ? `/${repoName}/` : '',
  trailingSlash: true,
  images: {
    unoptimized: true, // required for static export on GitHub Pages
  },
};

export default nextConfig;
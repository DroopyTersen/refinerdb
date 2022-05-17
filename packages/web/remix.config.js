/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  mdx: async () => {
    let rehypePlugin = await import("rehype-highlight").then(
      (mod) => mod.default
    );

    return {
      rehypePlugins: [rehypePlugin],
    };
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
};

// const rehypeHighlight = require("rehype-highlight");

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  browserBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "build",
  devServerBroadcastDelay: 1000,
  mdx: async () => {
    let rehypePlugin = await import("rehype-highlight").then((mod) => mod.default);

    return {
      rehypePlugins: [rehypePlugin],
    };
  },
};

module.exports = {
  mode: "jit",
  purge: [
    "./app/**/*.tsx",
    "./app/**/*.jsx",
    "./app/**/*.js",
    "./app/**/*.ts",
    "./app/**/*.mdx",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require("@tailwindcss/typography"),
  ],
  daisyui: {
    themes: [
      {
        refinerdb: {
          primary: "#ff6188",
          "primary-focus": "#cd5170",
          "primary-content": "#ffffff",
          secondary: "#ffd866",
          "secondary-focus": "#bda14c",
          "secondary-content": "#2c2a2e",
          accent: "#4ea7b1",
          "accent-focus": "#218997",
          "accent-content": "#ffffff",
          neutral: "#2c2a2e",
          "neutral-focus": "#383739",
          "neutral-content": "#ffffff",
          "base-100": "#2c4b54",
          "base-200": "#1b4855",
          "base-300": "#d1d5db",
          "base-content": "#ffffff",
          info: "#a3d0ff",
          success: "#88eca1",
          warning: "#ff9900",
          error: "#ff5724",
        },
      },
    ],
  },
};

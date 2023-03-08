const plugins = [
  [
    "babel-plugin-import",
    {
      libraryName: "lodash",
      libraryDirectory: "",
      camel2DashComponentName: false, // default: true
    },
  ],
];

module.exports = {
  // we also need next/babel preset to work with Next
  presets: [
    [
      "next/babel",
      {
        "styled-jsx": {
          plugins: ["styled-jsx-plugin-postcss"],
        },
        "preset-react": {
          runtime: "classic",
        },
      },
    ],
  ],
  plugins,
  babelrc: false,
};

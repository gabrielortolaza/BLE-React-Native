module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      { legacy: true }
    ],
    [
      "module:react-native-dotenv",
      {
        moduleName: "react-native-dotenv"
      }
    ],
    "react-native-reanimated/plugin",
  ]
};

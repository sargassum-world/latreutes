const path = require('path');

// A list of paths to transpile
const nodeModulesToTranspileRel = ["node_modules/@tauri-apps/api"]
const nodeModulesToTranspileAbs = nodeModulesToTranspileRel.map(name => path.resolve(__dirname, name))

module.exports = (config) => {
  // Find the babel-loader rule
  const babelLoaderRule = config.module.rules[1].oneOf.find(rule => rule.loader.includes("babel-loader"))

  // Add the paths we want to transpile
  babelLoaderRule.include = [
    babelLoaderRule.include,
    ...nodeModulesToTranspileAbs
  ]

  return config;
};

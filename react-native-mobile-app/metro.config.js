const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// FIXME: figure out why this is needed and what it does

// Allow importing from the local ../shared package (file:../shared).
config.watchFolders = [path.resolve(__dirname, "../shared")];

// Resolve deps from this app first, then shared's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../shared/node_modules"),
];

// Avoid Metro walking up the directory tree in monorepo setups.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

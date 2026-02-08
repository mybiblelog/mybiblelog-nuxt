const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// This file sets up the Metro bundler to use the shared package,
// configuring where to find the shared package and how to resolve dependencies.
// It also watches the shared package for changes and rebuilds the app automatically.

const workspaceRoot = path.resolve(__dirname, "..");

// Allow importing from the local ../shared package (file:../shared).
config.watchFolders = [workspaceRoot];

// Resolve deps from this app first, then shared's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Avoid Metro walking up the directory tree in monorepo setups.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

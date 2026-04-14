const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Bloqueia o Metro de subir para a raiz do monorepo
config.watchFolders = [projectRoot];

module.exports = config;

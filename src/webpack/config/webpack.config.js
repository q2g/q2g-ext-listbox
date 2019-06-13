const ExtensionService = require('../services/extension.service');
const CreateExtensionPlugin = require('../plugins/create-extension.plugin');
const DeployExtensionPlugin = require('../plugins/deploy-extension.plugin');
const ConcatEntryPointsPlugin = require('../plugins/concat-entry-points.plugin');
const path = require('path');

/** export modified webpack config */
module.exports = (config) => {

    const extensionService     = ExtensionService.getInstance();
    extensionService.rootDir   = config.context;
    extensionService.outDir    = config.output.path;
    extensionService.extOutDir = path.resolve(config.output.path, `../${extensionService.extensionName}`);

    // add custom plugins
    config.plugins = [
        ...config.plugins,
        new ConcatEntryPointsPlugin(),
        new CreateExtensionPlugin(),
        new DeployExtensionPlugin()
    ];

    config.output.jsonpFunction = extensionService.extensionName;
    
    /** set library target to umd for requirejs */
    config.output.libraryTarget = "umd";
    return config;
};

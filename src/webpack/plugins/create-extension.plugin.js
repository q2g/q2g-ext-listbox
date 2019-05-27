const concat = require('concat');
const resolve = require('path').resolve;
const existsSync = require('fs').existsSync;
const ExtensionService = require('../services/extension.service');

/**
 * bundle all generated files into one file and put them into ./dist/qlik-extension/<<EXTENSION_NAME>>.js
 * create qext and wbfolder file
 *
 * @class CreateExtensionPlugin
 */
class CreateExtensionPlugin {

    constructor() {
        this.extensionService = ExtensionService.getInstance();
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('ExtensionDone', async (comp, callback) => {

            const files = [
                resolve(this.extensionService.outDir, './runtime.js'),
                resolve(this.extensionService.outDir, './vendor.js'),
                resolve(this.extensionService.outDir, './extension-bundle.js'),
            ].filter((file) => existsSync(file));

            this.extensionService.createDistFolder();
            await concat(files, resolve(this.extensionService.extOutDir, `${this.extensionService.extensionName}.js`));
            this.extensionService.createQextFile();
            this.extensionService.createWbFolderFile();

            /** create zip file with all extension files on end */
            await this.extensionService.createZipFile();
            callback();
        });
    }
}

module.exports = CreateExtensionPlugin;

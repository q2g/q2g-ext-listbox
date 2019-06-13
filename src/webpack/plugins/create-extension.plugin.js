const concat = require('concat');
const resolve = require('path').resolve;
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
        compiler.hooks.afterEmit.tapAsync('ExtensionDone', async (compilation, callback) => {

            /** compilation.emittedAssets */
            const files = [...compilation.emittedAssets]
                .filter((file) => file.match(/-es5\.js$/))
                .sort((file) => file.indexOf('extension-bundle') === 0 ? 1 : -1)
                .map((file) => resolve(this.extensionService.outDir, file));

            if (!files.length) {
                this.extensionService.isDirty = false;
                callback();
                return;
            }

            this.extensionService.createDistFolder();
            await concat(files, resolve(this.extensionService.extOutDir, `${this.extensionService.extensionName}.js`));
            this.extensionService.createQextFile();
            this.extensionService.createWbFolderFile();

            /** create zip file with all extension files on end */
            await this.extensionService.createZipFile();
            this.extensionService.isDirty = true;
            callback();
        });
    }
}

module.exports = CreateExtensionPlugin;

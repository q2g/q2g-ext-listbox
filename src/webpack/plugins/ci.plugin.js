const ExtensionService = require('../services/extension.service');
const QrsService = require('../services/qrs.service');
const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;

/**
 * continues integration for our extension
 * to import / update extension in QRS so we dont have to copy it all the time
 * or development in qlik sense extension folder (bad thing)
 *
 * @class CiPlugin
 */
class CiPlugin {

    constructor(outDir) {
        this.qrsService = new QrsService();
        this.extensionService = ExtensionService.getInstance();
        this.outputDirectory = outDir;

        const dir = process.env.ALLUSERSPROFILE;
        this.qrsService.certificateRoot = `${dir}\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates`;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync("ExtensionDone", async (comp, callback) => {
            await this.deployQrs();
            callback();
        });
    }

    async deployQrs() {
        const extensionName = this.extensionService.extensionName;
        const exists = await this.qrsService.extensionExists(extensionName);
        const msg = exists ? `QRS$: update extension ${extensionName}` : `QRS$: import extension ${extensionName}`;
        const outDir = this.extensionService.extOutDir;
        let file;

        if (exists) {
            file = readFileSync(resolve(outDir, `${extensionName}.js`));
            await this.qrsService.updateExtension(extensionName, file);
        } else {
            file = readFileSync(resolve(outDir, `${extensionName}.zip`));
            await this.qrsService.importExtension(extensionName, file);
        }

        process.stdout.write(`\n${msg}\n`);
        process.stdout.write(`${"-".repeat(msg.length)}\n\n`);
    }
}

module.exports = CiPlugin;

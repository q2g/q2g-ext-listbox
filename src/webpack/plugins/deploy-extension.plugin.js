const ExtensionService = require('../services/extension.service');
const QrsService = require('../services/qrs.service');
const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;
const basename = require("path").basename;
const home = require('os').homedir();
const fs = require('fs');

/**
 * deploy current extension build to qrs / qlik sense desktop
 *
 * @class DeployExtensionPlugin
 */
class DeployExtensionPlugin {

    constructor(outDir) {
        this.qrsService = new QrsService();
        this.extensionService = ExtensionService.getInstance();
        this.outputDirectory = outDir;

        const dir = process.env.ALLUSERSPROFILE;
        this.qrsService.certificateRoot = `${dir}\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates`;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync("ExtensionDone", async (compilation, callback) => {
            await this.deployQrs();
            this.deployDesktop();
            callback();
        });
    }

    /**
     * deploy extension to qrs
     */
    async deployQrs() {
        const extensionName = this.extensionService.extensionName;
        const exists = await this.qrsService.extensionExists(extensionName);
        const msg = exists ? `Ci$: qrs update extension ${extensionName}` : `Ci$:qrs import extension ${extensionName}`;
        const outDir = this.extensionService.extOutDir;
        let file;

        if (exists) {
            file = readFileSync(resolve(outDir, `${extensionName}.js`));
            await this.qrsService.updateExtension(extensionName, file);
        } else {
            file = readFileSync(resolve(outDir, `${extensionName}.zip`));
            await this.qrsService.importExtension(extensionName, file);
        }
        process.stdout.write(`\n${msg}`);
    }

    /**
     * deploy extension to desktop
     */
    async deployDesktop() {
        const extensionName = this.extensionService.extensionName;
        const outDir = this.extensionService.extOutDir;
        const files = [
            resolve(outDir, `${extensionName}.js`),
            resolve(outDir, `${extensionName}.qext`),
            resolve(outDir, `wbfolder.wbl`),
        ];

        const path   = resolve(home, './Documents/Qlik/Sense/Extensions');
        const extDir = resolve(path, `./${extensionName}`);

        /** create extension directory if not exists allready */
        if (!fs.existsSync(extDir)) {
            fs.mkdirSync(extDir);
        }

        /** copy files */
        files.forEach((file) => {
            const filePath = resolve(extDir, `./${basename(file)}`);
            const fileData = fs.readFileSync(file, {encoding: 'utf8'});
            fs.writeFileSync(filePath, fileData);
        });

        const msg = `Ci$: copy ${extensionName} to ${path}`;
        process.stdout.write(`\n${msg}`);
    }
}

module.exports = DeployExtensionPlugin;

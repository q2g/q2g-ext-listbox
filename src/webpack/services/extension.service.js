const resolve = require('path').resolve;
const pathSeperator = require('path').sep;
const fs = require('fs');
const JsZip = require('jszip');

class ExtensionService {

    constructor() {
        this._extensionName = null;
        this._packageData   = null;
        this._rootDirectory = process.cwd();
        this._outDirectory  = process.cwd();
        this._extOutDir     = process.cwd();
        this._isDirty       = false;
    }

    set isDirty(dirty) {
        this._isDirty = dirty;
    }

    get isDirty() {
        return this._isDirty;
    }

    set rootDir(path) {
        this._rootDirectory = path;
    }

    set outDir(path) {
        this._outDirectory = path;
    }

    get outDir() {
        return this._outDirectory;
    }

    set extOutDir(path) {
        this._extOutDir = path;
    }

    get extOutDir() {
        return this._extOutDir;
    }

    /** 
     * read out process arguments, default pattern: [ng build PKG_NAME <options>]
     * 
     * but order dosent matters, so filter out first 3 arguments (node.exe, ng command, build argument) and 
     * all other arguments which starts with "--" and declared as option
     * 
     * at this point we could say, extension name is a given project name or 
     * the name from package.json
     */
    get extensionName() {

        if (!this._extensionName) {
            const projectName = process.argv.filter((arg, index) => index > 2 && arg.slice(0, 2) !== "--");
            this._extensionName = projectName.length ? projectName[0] : this.packageData.name;
        }
        return this._extensionName;
    }

    get packageData() {
        if (!this._packageData) {
            const pkgJson = resolve(this._rootDirectory, './package.json');
            this._packageData = JSON.parse(fs.readFileSync(pkgJson, {encoding: "utf8"}));
        }
        return this._packageData;
    }

    get qextFileData() {
        const pkgData = this.packageData;

        /** merge default qext data with, qext section from package.json */
        return Object.assign({
            "author": pkgData.author || "",
            "dependencies": {
                "qlik-sense": ""
            },
            "description": pkgData.description || "", 
            "icon": "",
            "license": pkgData.license || "",
            "repository": pkgData.repository ? pkgData.repository.url : "",
            "type": "visualization",
            "version": pkgData.version,
        }, 
        pkgData.qext,
        {
            id: this.extensionName,
            name: this.extensionName
        });
    }

    /** create qext file */
    createQextFile() {
        const filePath = resolve(this.extOutDir, `${this.extensionName}.qext` );
        /** we require default qext values here */
        fs.writeFileSync(filePath, JSON.stringify(this.qextFileData, null, 4), { encoding: "utf8" });
    }

    /** create wbfolder file */
    createWbFolderFile() {
        const filePath = resolve(this.extOutDir, `wbfolder.wbl`);
        fs.writeFileSync(filePath, "", { encoding: "utf8" });
    }

    /** create extension directory */
    createDistFolder() {
        const paths = this.extOutDir.split(pathSeperator);
        let fullPath = "";
        paths.forEach((partial) => {
            if (fullPath === "") {
                fullPath = partial;
            } else {
                fullPath = [fullPath, partial].join(pathSeperator);
            }

            try {
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath);
                }
            } catch (error) {
                process.stderr.write(`Could not create Directory: ${fullPath}`);
            }
        });
    }

    /** create zip file for extension */
    async createZipFile() {

        const qextFile = resolve(this.extOutDir, `./${this.extensionName}.qext`);
        const jsFile   = resolve(this.extOutDir, `./${this.extensionName}.js`)
        const wbFolder = resolve(this.extOutDir, `./wbfolder.wbl`) ;

        /** create new JsZip instance and add extension specific files */
        const jsZip = new JsZip();
        jsZip.file(`${this.extensionName}.qext`, fs.readFileSync(qextFile));
        jsZip.file(`${this.extensionName}.js`  , fs.readFileSync(jsFile));
        jsZip.file(`wbfolder.wbl`, fs.readFileSync(wbFolder));

        /** generate zip file content */
        const zipContent = await jsZip.generateAsync({
            type: 'nodebuffer',
            comment: this.qextFileData.description,
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        /** create zip file */
        fs.writeFileSync(resolve(this.extOutDir, `${this.extensionName}.zip`), zipContent);
        return true;
    }
}

let instance;
module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new ExtensionService();
        }
        return instance;
    }
}
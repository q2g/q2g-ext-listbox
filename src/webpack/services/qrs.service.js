const request = require('https').request;
const resolve = require('path').resolve;
const readFileSync = require('fs').readFileSync;
const stringify = require('querystring').stringify;

class QrsService {

    constructor() {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        this.host = 'localhost';
    }

    set certificateRoot(path) {
        this.certRoot = path;
    }

    /**
     * fetch extension by name, return empty array if no extensions found
     * @todo check for qrs typings
     *
     * @param {string} name
     * @returns {Promise<any>}
     * @memberof QrsService
     */
    async fetchExtension(name) {

        return new Promise((finalize, reject) => {

            const params = {
                filter: `name eq '${name}'`,
                xrfkey: "abcdefghijklmnop",
            };

            const options = {
                ...this.requestOptions,
                ...{
                    method: "GET",
                    path: `/qrs/extension?${stringify(params)}`,
                },
            };

            request(options, (res) => {
                res.on("data", (chunk) => {
                    if (res.statusCode !== 200) {
                        reject("error");
                    }
                    const extensions = JSON.parse(chunk.toString());
                    finalize(extensions);
                });

                res.on("error", () => {
                    reject();
                });
            })
            .end();
        });
    }

    /**
     * import extension to qrs
     *
     * @param {string} name
     * @param {Buffer} file
     * @returns {Promise<boolean>}
     * @memberof QrsService
     */
    importExtension(name, file) {

        return new Promise((finalize, reject) => {

            const params = {
                privileges: true,
                pwd: "",
                xrfkey: "abcdefghijklmnop",
            };

            const options = {
                ...this.requestOptions,
                ...{
                    headers: {
                        ...this.requestOptions.headers,
                        "Content-Length": file.length,
                        "Content-Type"  : "application/vnd.qlik.sense.app",
                    },
                    method: "POST",
                    path: `/qrs/extension/upload?${stringify(params)}`,
                },
            };

            const req = request(options, (res) => {
                res.on("data", (chunk) => {
                    if (res.statusCode !== 201) {
                        reject("status code not 201");
                    }
                    finalize();
                });

                res.on("error", (err) => {
                    process.stderr.write(err.message);
                });
            });

            req.write(file);
            req.end();
        });
    }

    updateExtension(name, file) {

        return new Promise((finalize, reject) => {

            const params = {
                externalPath: `${name}.js`,
                overwrite: true,
                xrfkey: "abcdefghijklmnop",
            };

            const options = {
                ...this.requestOptions,
                ...{
                    headers: {
                        ...this.requestOptions.headers,
                        "Content-Length": file.length,
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    method: "POST",
                    path: `/qrs/extension/${name}/uploadfile?${stringify(params)}`,
                },
            };

            const req = request(options, (res) => {
                res.on("data", (chunk) => {
                    if (res.statusCode !== 201) {
                        reject("status code not 201");
                    }
                    finalize();
                });

                res.on("error", (err) => {
                    reject(err.message);
                });
            });

            req.write(file);
            req.end();
        });
    }

    async extensionExists(name) {
        const extensions = await this.fetchExtension(name);
        return Array.isArray(extensions) && extensions.length > 0;
    }

    /**
     * if request options not exists, create them
     *
     * @readonly
     * @private
     * @memberof QrsService
     */
    get requestOptions() {
        if (!this.reqOptions) {
            this.reqOptions = this.createRequestOptions();
        }
        return this.reqOptions;
    }

    /**
     * create request options object
     *
     * @private
     * @memberof QrsService
     */
    createRequestOptions() {

        const ca   = readFileSync(resolve(this.certRoot, "root.pem"));
        const cert = readFileSync(resolve(this.certRoot, "client.pem"));
        const key  = readFileSync(resolve(this.certRoot, "client_key.pem"));

        // not empty
        return {
            ca,
            cert,
            headers: {
                "Content-Type" : "application/x-www-form-urlencoded",
                "X-Qlik-User"  : "UserDirectory= Internal; UserId= sa_repository",
                "x-qlik-xrfkey": "abcdefghijklmnop",
            },
            hostname: this.host,
            key,
            method: "GET",
            port: "4242",
        };
    }
}

module.exports = QrsService;

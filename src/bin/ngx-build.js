const childProcess = require("child_process");
const path = require("path");
const cow = require("./cow-say.command");
const concat = require("concat");

/**
 * build ngx component
 */
const cliPath = path.resolve(process.cwd(), 'node_modules/@angular/cli/bin/ng');
// const args = [cliPath, "build", "--prod", "--preserve-symlinks"]; /** prod mode */
const args = [cliPath, "build", "--watch", "--preserve-symlinks"];
let isCreateBundle = false;

cow.say(` Create CustomElement for listbox, this can take a while.`);

/** spawn new process */
const ngProcess = childProcess.spawn("node", args);
ngProcess.stdout.on("data", (data) => {
    const message = data.toString();
    if (!/^\n$/.test(message)) {
        console.log(message);
    }

    if (!isCreateBundle) {
        isCreateBundle = true;
        buildDevBundle();
        isCreateBundle = false;
    }
});

ngProcess.stdout.on("error", (error) => {
    console.log(error);
});

/** @todo create bundle for development mode */
function buildDevBundle() {
    const files = [
        path.resolve(process.cwd(), './listbox/dist/runtime.js'),
        path.resolve(process.cwd(), './listbox/dist/polyfills.js'),
        path.resolve(process.cwd(), './listbox/dist/scripts.js'),
        /** comment out for prod mode */
        path.resolve(process.cwd(), './listbox/dist/vendor.js'),
        path.resolve(process.cwd(), './listbox/dist/main.js'),
    ];
    concat(files, path.resolve(process.cwd(), 'extension/listbox.element.js'));
    cow.say('Created bundle listbox.element.js');
}

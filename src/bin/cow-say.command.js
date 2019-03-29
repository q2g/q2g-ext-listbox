"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
var CowType;
(function (CowType) {
    CowType[CowType["ERROR"] = 0] = "ERROR";
    CowType[CowType["DEFAULT"] = 1] = "DEFAULT";
})(CowType = exports.CowType || (exports.CowType = {}));
const cow = `
        \\  ^__^
         \\ (oo)\\_______
           (__)\\       )\\/\\
               ||----w |
           ____||_____||__

`;
const errorCow = `
        \\  ^__^
         \\ (xx)\\_______
           (__)\\       )\\/\\
               ||----w |
           ____||_____||__

`;
function say(message, type = CowType.DEFAULT) {
    if (!util_1.isArray(message)) {
        message = [...message.split(/\n/)];
    }
    const maxLength = message.reduce((prev, current) => {
        return Math.max(prev, current.length);
    }, 0);
    const messageLines = message.map((line) => {
        const lineLength = line.length;
        return `| ${line}${" ".repeat(maxLength - lineLength)} |`;
    });
    const messageBox = `
+-${"-".repeat(maxLength)}-+
${messageLines.join("\n")}
+-${"-".repeat(maxLength)}-+`;
    process.stdout.write(messageBox);
    switch (type) {
        case CowType.ERROR:
            process.stdout.write(errorCow);
            break;
        default:
            process.stdout.write(cow);
    }
}
exports.say = say;

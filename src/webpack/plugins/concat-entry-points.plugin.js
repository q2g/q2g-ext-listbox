/**
 * concat all entry points which will generated via angular cli, for qlik sense (require.js)
 * we have to ensure we have only one export (umd module) and not multiple, to solve the problem 
 * we concat all entry points into one
 *
 * @class ConcatEntryPointsPlugin
 */
class ConcatEntryPointsPlugin {

    apply(compiler) {
        compiler.hooks.entryOption.tap('RewriteEntryPoints', () => {

            const webpackEntry = compiler.options.entry;
            /** 
             * get all entry points and sort them so main is allways at last position
             * but all other entry points will stay in order.
             * This is important since the last value in this array is the one which will be exported
             * and this should be the extension (main)
             */
            const entryPoints = Object.keys(webpackEntry).sort((entry) => entry === 'main' ? 1 : -1);
            const entryFiles = [];

            entryPoints.forEach((key) => {
                /** ensure we allways handle an array */
                const files = Array.isArray(webpackEntry[key]) ? webpackEntry[key] : [webpackEntry[key]];
                /** write files into new entry files array */
                entryFiles.push(...files);
                /** remove old entry point */
                delete webpackEntry[key];
            });

            /** create new file chunk named "extension-bundle" which combine all previous entry points */
            webpackEntry['extension-bundle'] = entryFiles;
        });
    }
}

module.exports = ConcatEntryPointsPlugin;

import del from 'del';
import * as esbuild from 'esbuild';
import Mocha from 'mocha';
import { ESLint } from 'eslint';

import gulp, { TaskFunctionCallback } from 'gulp';
import gulp_typescript from 'gulp-typescript';

/**
 * Cleans the build directories
 */
export function clean(): Promise<string[]> {
    return del([
        './dist',
        './dist-test'
    ])
}
clean.description = 'Cleans the build directories';

/**
 * Bundles the plugin.
 */
export async function bundle(): Promise<void> {
    await esbuild.build({
        entryPoints: ['./src/index.ts'],
        bundle: true,
        minify: true,
        outfile: './dist/index.js',
        format: 'cjs',
        platform: 'node',
        target: 'node12'
    });
}
clean.description = 'Bundles the plugin';

/**
 * Generates type definitions for the plugin.
 */
export function types(): NodeJS.ReadWriteStream {
    const project = gulp_typescript.createProject('tsconfig.json');
    return project.src()
        .pipe(project())
        .pipe(gulp.dest('dist'));
}
clean.description = 'Generates type definitions for the plugin';

/**
 * Runs tests
 */
export function test(done: TaskFunctionCallback): void {
    const mocha = new Mocha();
    mocha.addFile('./test/test.ts');
    mocha.run((failCount) => {
        if (failCount) {
            done(new Error(`${failCount} tests failed.`));
        }
        else {
            done();
        }
    })
}
test.description = 'Runs tests';

/**
 * Runs lint
 */
export async function lint(): Promise<void> {
    const eslint = new ESLint();
    const results = await eslint.lintFiles('.');
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log(resultText);
    const errorCount = results.reduce((pv, result) => pv + result.errorCount, 0);
    if (errorCount > 0) process.exitCode = 1;
}
test.description = 'Runs lint';

// TODO(jlfwong): The original version of this line also did type generation.
// I disabled it because of depedency rot leading to build failure.
//
// [17:36:46] 'types' errored after 208 ms
// [17:36:46] Error: You must provide the URL of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer
//     at readWasm (/Users/jlfwong/code/esbuild-plugin-wasm-pack/node_modules/gulp-typescript/node_modules/source-map/lib/read-wasm.js:8:13)
//     at wasm (/Users/jlfwong/code/esbuild-plugin-wasm-pack/node_modules/gulp-typescript/node_modules/source-map/lib/wasm.js:25:16)
//     at /Users/jlfwong/code/esbuild-plugin-wasm-pack/node_modules/gulp-typescript/node_modules/source-map/lib/source-map-consumer.js:264:14
//     at processTicksAndRejections (node:internal/process/task_queues:105:5)
//
// export const build = gulp.series(clean, gulp.parallel(bundle, types));
export const build = gulp.series(clean, gulp.parallel(bundle));
export const prepare = gulp.series(build);
export const prepublishOnly = gulp.series(lint, test);
export default build;

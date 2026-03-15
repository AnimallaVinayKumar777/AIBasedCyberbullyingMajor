import { build } from 'esbuild';
import { execSync } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import path from 'path';

const root = process.cwd();
const sdkRoot = path.join(root, 'packages', 'safenet-sdk');
const srcEntry = path.join(sdkRoot, 'src', 'index.ts');
const outDir = path.join(sdkRoot, 'dist');

// Node.js built-in modules to exclude from browser bundle
const nodeBuiltins = ['fs', 'path', 'crypto', 'stream', 'buffer', 'http', 'https', 'url', 'zlib', 'util', 'events', 'os', 'child_process', 'module'];

async function runBuild() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await build({
    entryPoints: [srcEntry],
    outfile: path.join(outDir, 'index.js'),
    bundle: true,
    format: 'esm',
    target: ['es2020'],
    platform: 'browser',
    sourcemap: true,
    external: nodeBuiltins
  });

  await build({
    entryPoints: [srcEntry],
    outfile: path.join(outDir, 'index.iife.js'),
    bundle: true,
    format: 'iife',
    globalName: 'SafeNetSDK',
    target: ['es2020'],
    platform: 'browser',
    sourcemap: true,
    external: nodeBuiltins
  });

  // TypeScript declaration generation - temporarily disabled due to cross-package imports
  // execSync('npx tsc -p packages/safenet-sdk/tsconfig.json', { stdio: 'inherit' });

  console.log('✅ SDK build complete:', outDir);
}

runBuild().catch(error => {
  console.error('❌ SDK build failed:', error);
  process.exit(1);
});

import { build } from 'esbuild';
import { copyFile, mkdir, readdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const production = args.includes('--production');

const root = process.cwd();
const outDir = path.join(root, 'dist', 'extension');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function copyAssets() {
  await ensureDir(outDir);
  await copyFile(path.join(root, 'manifest.json'), path.join(outDir, 'manifest.json'));
  await copyFile(path.join(root, 'src', 'extension', 'popup.html'), path.join(outDir, 'popup.html'));

  const contentCssPath = path.join(root, 'src', 'extension', 'content.css');
  if (existsSync(contentCssPath)) {
    await copyFile(contentCssPath, path.join(outDir, 'content.css'));
  }

  const iconsPath = path.join(root, 'icons');
  if (existsSync(iconsPath)) {
    await copyDir(iconsPath, path.join(outDir, 'icons'));
  } else {
    console.warn('⚠️  icons/ folder not found. Create icons to avoid extension warnings.');
  }
}

async function runBuild() {
  await rm(outDir, { recursive: true, force: true });

  const common = {
    bundle: true,
    sourcemap: !production,
    minify: production,
    target: ['es2020'],
    platform: 'browser',
    external: ['fs', 'path', 'crypto', 'os', 'buffer']
  };

  await Promise.all([
    build({
      ...common,
      entryPoints: [path.join(root, 'src', 'extension', 'background.ts')],
      outfile: path.join(outDir, 'background.js'),
      format: 'esm'
    }),
    build({
      ...common,
      entryPoints: [path.join(root, 'src', 'extension', 'content.ts')],
      outfile: path.join(outDir, 'content.js'),
      format: 'iife'
    }),
    build({
      ...common,
      entryPoints: [path.join(root, 'src', 'extension', 'popup.ts')],
      outfile: path.join(outDir, 'popup.js'),
      format: 'iife'
    })
  ]);

  await copyAssets();
  console.log('✅ Extension build complete:', outDir);
}

runBuild().catch(error => {
  console.error('❌ Extension build failed:', error);
  process.exit(1);
});

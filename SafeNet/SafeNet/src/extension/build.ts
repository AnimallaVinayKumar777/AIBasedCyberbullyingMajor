// Build script for ChirpGuard Chrome extension
import { exec } from 'child_process';
import { promisify } from 'util';
import { copyFile, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';

const execAsync = promisify(exec);

interface BuildOptions {
  watch?: boolean;
  production?: boolean;
}

async function buildExtension(options: BuildOptions = {}) {
  const { watch = false, production = false } = options;

  console.log('🔨 Building ChirpGuard Chrome Extension...');

  try {
    // Create dist directory
    await mkdir('dist', { recursive: true });

    // Compile TypeScript files
    const tscCommand = `npx tsc --project tsconfig.json --outDir dist ${watch ? '--watch' : ''}`;
    console.log('📝 Compiling TypeScript...');

    if (watch) {
      exec(tscCommand);
    } else {
      await execAsync(tscCommand);
    }

    // Copy static files
    console.log('📋 Copying static files...');

    // Copy manifest
    await copyFile('manifest.json', 'dist/manifest.json');

    // Copy HTML files
    await copyFile('src/extension/popup.html', 'dist/popup.html');

    // Create CSS file for content script (if needed)
    await writeFile('dist/content.css', `
      /* ChirpGuard Content Script Styles */
      .chirpguard-overlay {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(239, 68, 68, 0.1) !important;
        backdrop-filter: blur(2px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 1000 !important;
        border-radius: 16px !important;
        border: 2px solid rgba(239, 68, 68, 0.3) !important;
      }

      .chirpguard-warning {
        text-align: center !important;
        padding: 16px !important;
        background: rgba(0, 0, 0, 0.8) !important;
        border-radius: 12px !important;
        color: white !important;
        max-width: 90% !important;
      }
    `);

    // Generate icons (placeholder)
    await generateIcons();

    console.log('✅ Extension built successfully!');
    console.log('📦 Files created in dist/ directory');
    console.log('🔍 To load extension:');
    console.log('   1. Open Chrome and go to chrome://extensions/');
    console.log('   2. Enable "Developer mode"');
    console.log('   3. Click "Load unpacked" and select the dist/ folder');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function generateIcons() {
  // For now, skip icon generation in Node.js environment
  // In a real scenario, you'd use a proper icon generation library like 'canvas' npm package
  console.log('📸 Icon generation skipped - would need canvas library for Node.js');
  console.log('ℹ️  Please manually create icon files in dist/icons/ directory:');
  console.log('   - icon16.png (16x16)');
  console.log('   - icon32.png (32x32)');
  console.log('   - icon48.png (48x48)');
  console.log('   - icon128.png (128x128)');
}

async function watchExtension() {
  console.log('👀 Watching for changes...');
  return buildExtension({ watch: true });
}

async function buildProduction() {
  console.log('🏭 Building for production...');
  return buildExtension({ production: true });
}

// CLI interface
const command = process.argv[2] || 'build';

switch (command) {
  case 'build':
    buildExtension();
    break;
  case 'watch':
    watchExtension();
    break;
  case 'production':
    buildProduction();
    break;
  default:
    console.log('Usage: npm run build:extension [build|watch|production]');
    process.exit(1);
}

// For ES modules, we don't need exports at the end
// The functions are already available in this module scope
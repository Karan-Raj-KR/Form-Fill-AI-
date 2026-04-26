import { build } from 'esbuild';
import fs from 'fs';
async function buildExtension() {
  try {
    // Build content script (IIFE format required for content script injection)
    await build({
      entryPoints: ['src/content/index.ts'],
      bundle: true,
      outfile: 'dist/content.js',
      target: 'chrome100',
      format: 'iife',
      minify: true,
    });

    // Copy content styles
    fs.copyFileSync('src/content/styles.css', 'dist/content-styles.css');

    // Build background service worker
    // IMPORTANT: Service workers MUST NOT be obfuscated — Chrome's MV3 worker
    // runtime rejects scripts that use control-flow flattening, dead code injection,
    // or self-defending patterns (status code 15). We only minify it.
    await build({
      entryPoints: ['src/background/index.ts'],
      bundle: true,
      outfile: 'dist/background.js',
      target: 'chrome100',
      format: 'iife',
      minify: true,
    });

    // Removed obfuscation to comply with Chrome Web Store policies.
    // The code is minified by esbuild, which safely reduces file size.
    console.log('✅ Extension built and minified safely. Ready for Web Store.');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();

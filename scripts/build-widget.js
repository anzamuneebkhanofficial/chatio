const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    console.log('[Build Widget] Building standalone Shadow DOM embed widget (public/widget.js)...');

    await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/widget/embed.js')],
      outfile: path.join(__dirname, '../public/widget.js'),
      bundle: true,
      minify: true,
      format: 'iife',
      target: ['es2020'],
      platform: 'browser',
    });

    console.log('[Build Widget] ✅ Successfully generated public/widget.js!');
  } catch (err) {
    console.error('[Build Widget] ❌ Build failed:', err);
    process.exit(1);
  }
}

build();

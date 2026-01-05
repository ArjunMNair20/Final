#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const EXTENSIONS = new Set(['.js', '.css', '.html', '.svg', '.json', '.wasm', '.ico', '.txt', '.xml']);

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

function shouldCompress(file) {
  const ext = path.extname(file).toLowerCase();
  return EXTENSIONS.has(ext);
}

function compressFile(file) {
  try {
    const src = fs.readFileSync(file);

    // gzip
    const gzPath = file + '.gz';
    if (!fs.existsSync(gzPath) || fs.statSync(gzPath).mtime < fs.statSync(file).mtime) {
      const gz = zlib.gzipSync(src, { level: zlib.constants.Z_BEST_COMPRESSION });
      fs.writeFileSync(gzPath, gz);
      console.log('Wrote', gzPath);
    }

    // brotli
    if (typeof zlib.brotliCompressSync === 'function') {
      const brPath = file + '.br';
      if (!fs.existsSync(brPath) || fs.statSync(brPath).mtime < fs.statSync(file).mtime) {
        const br = zlib.brotliCompressSync(src, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        });
        fs.writeFileSync(brPath, br);
        console.log('Wrote', brPath);
      }
    }
  } catch (err) {
    console.error('Failed compressing', file, err);
  }
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const allFiles = walk(DIST_DIR);
  const candidates = allFiles.filter(shouldCompress);
  console.log(`Compressing ${candidates.length} files in ${DIST_DIR}...`);
  candidates.forEach(compressFile);
  console.log('Precompression complete.');
}

main();

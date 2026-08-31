import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = Date.now().toString();

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write to public/version.json
fs.writeFileSync(
  path.join(publicDir, 'version.json'),
  JSON.stringify({ version }, null, 2)
);

// Ensure src directory exists
const srcDir = path.join(__dirname, '../src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// Write to src/version.js
fs.writeFileSync(
  path.join(srcDir, 'version.js'),
  `export const BUILD_VERSION = ${JSON.stringify(version)};\n`
);

console.log(`Version generated: ${version}`);

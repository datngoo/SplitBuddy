import { readFile, writeFile } from 'node:fs/promises';
const revision = process.env.GITHUB_SHA;
if (!revision || !/^[a-f0-9]{40}$/.test(revision)) throw new Error('Expected GitHub commit SHA');
const file = new URL('../docs/sw.js', import.meta.url);
const source = await readFile(file, 'utf8');
await writeFile(file, source.replace("const CACHE = CACHE_PREFIX + 'v1';", `const CACHE = CACHE_PREFIX + '${revision}';`));
console.log('Offline cache version set to deployment commit.');

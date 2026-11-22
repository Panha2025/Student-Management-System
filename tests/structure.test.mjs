import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? findFiles(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
}
const modules = (await findFiles(resolve(root, 'src'))).filter((file) => ['.js', '.jsx'].includes(extname(file)));
const graph = new Map();
for (const file of modules) {
  const source = await readFile(file, 'utf8');
  const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  graph.set(file, imports.filter((path) => path.startsWith('.')).map((path) => resolve(dirname(file), path)));
}

test('Vite HTML uses the React entry and public assets exist', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  assert.match(html, /<script type="module" src="\/src\/main\.jsx"><\/script>/);
  for (const asset of ['public/images/aupp-logo.png', 'public/images/aupp-campus.jpg', 'public/icons/favicon.svg']) {
    assert.ok((await stat(resolve(root, asset))).isFile(), `Missing asset ${asset}`);
  }
  const entry = await readFile(resolve(root, 'src/main.jsx'), 'utf8');
  assert.match(entry, /createRoot/);
  assert.match(entry, /<App \/>/);
  assert.doesNotMatch(entry, /AuthProvider|ProtectedRoute|firebase/i);
});

test('local imports resolve, the React source has no cycles or orphan modules', () => {
  const visited = new Set();
  function visit(file, parents = []) {
    assert.ok(graph.has(file), `Missing import: ${relative(root, file)}`);
    assert.ok(!parents.includes(file), `Import cycle: ${[...parents, file].map((item) => relative(root, item)).join(' → ')}`);
    if (visited.has(file)) return;
    for (const dependency of graph.get(file)) visit(dependency, [...parents, file]);
    visited.add(file);
  }
  visit(resolve(root, 'src/main.jsx'));
  assert.deepEqual([...graph.keys()].filter((file) => !visited.has(file)).map((file) => relative(root, file)), [], 'Every source module should have an application responsibility.');
});

test('API and storage access stay inside their service modules', async () => {
  for (const file of modules) {
    const source = await readFile(file, 'utf8');
    const name = relative(root, file);
    if (name !== 'src/services/storageService.js') assert.doesNotMatch(source, /\blocalStorage\s*\.\s*(getItem|setItem|removeItem|clear)\s*\(/, name);
    if (name !== 'src/api/http.js') assert.doesNotMatch(source, /\bfetch\s*\(/, name);
  }
});

test('package scripts provide dev server, build, preview, and tests', async () => {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.deepEqual(pkg.scripts, { dev: 'vite', build: 'vite build', preview: 'vite preview', test: 'node --test' });
  assert.ok(pkg.dependencies.react && pkg.dependencies['react-dom'] && pkg.devDependencies.vite);
  assert.equal(pkg.dependencies.firebase, undefined);
});

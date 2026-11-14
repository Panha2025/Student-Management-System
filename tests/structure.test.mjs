import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? findFiles(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return groups.flat();
}

const scripts = (await findFiles(resolve(root, 'js'))).filter((file) => file.endsWith('.js'));
const graph = new Map();
for (const file of scripts) {
  const source = await readFile(file, 'utf8');
  const dependencies = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g)]
    .map((match) => resolve(dirname(file), match[1]));
  graph.set(file, dependencies);
}

test('every JavaScript module parses', () => {
  for (const file of scripts) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('all imports resolve, the module graph has no cycles, and no module is orphaned', () => {
  const visited = new Set();
  function visit(file, ancestors = []) {
    assert.ok(graph.has(file), `Missing module: ${relative(root, file)}`);
    assert.ok(!ancestors.includes(file), `Circular import: ${[...ancestors, file].map((path) => relative(root, path)).join(' → ')}`);
    if (visited.has(file)) return;
    for (const dependency of graph.get(file)) visit(dependency, [...ancestors, file]);
    visited.add(file);
  }
  visit(resolve(root, 'js/app.js'));
  assert.deepEqual([...graph.keys()].filter((file) => !visited.has(file)), [], 'Remove unused modules after checking their replacements.');
});

test('HTML loads all five stylesheets and the module entry through existing relative paths', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  assert.match(html, /<script type="module" src="js\/app\.js"><\/script>/);
  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(styles, ['css/base.css', 'css/layout.css', 'css/components.css', 'css/pages.css', 'css/responsive.css']);
  const assets = [...html.matchAll(/(?:src|href)="((?:js|css|assets)\/[^"#]+)"/g)].map((match) => match[1]);
  for (const asset of assets) assert.ok((await stat(resolve(root, asset))).isFile(), `Missing asset: ${asset}`);
});

test('UI modules do not access fetch or localStorage directly', async () => {
  for (const file of scripts) {
    const source = await readFile(file, 'utf8');
    const name = relative(root, file);
    if (name !== 'js/services/storageService.js') {
      assert.doesNotMatch(source, /\blocalStorage\s*\.\s*(getItem|setItem|removeItem|clear)\s*\(/, name);
    }
    if (name !== 'js/api/http.js') assert.doesNotMatch(source, /\bfetch\s*\(\s*[^)\s]/, name);
  }
});

test('Live Server serves the HTML, CSS, favicon, and complete module graph', {
  skip: !process.env.CAMPUSFLOW_URL,
}, async () => {
  const resources = ['index.html', 'assets/icons/favicon.svg',
    ...(await findFiles(resolve(root, 'css'))).map((file) => relative(root, file)),
    ...scripts.map((file) => relative(root, file))];
  for (const resource of resources) {
    const response = await fetch(new URL(resource, process.env.CAMPUSFLOW_URL));
    assert.equal(response.status, 200, `${resource}: HTTP ${response.status}`);
    const type = response.headers.get('content-type');
    if (resource.endsWith('.js')) assert.match(type, /javascript/, resource);
    if (resource.endsWith('.css')) assert.match(type, /text\/css/, resource);
    assert.ok((await response.text()).trim().length, `Empty response: ${resource}`);
  }
});

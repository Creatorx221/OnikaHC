import assert from 'node:assert/strict';

// Run only against a loopback Sites development server where local_seedy is an
// approved editor and CMS_ADMIN_USER_IDS names a different local fixture.
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Tests must run locally.');
const headers = { Cookie: '__sites_local_auth=1' };
let checks = 0;

async function request(path, { method = 'GET', json, body, extraHeaders = {}, status = 200 } = {}) {
  const response = await fetch(origin + path, {
    method,
    redirect: 'manual',
    headers: {
      ...headers,
      ...(method === 'GET' ? {} : { Origin: origin }),
      ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...extraHeaders,
    },
    body: json === undefined ? body : JSON.stringify(json),
  });
  const text = await response.text();
  assert.equal(response.status, status, `${method} ${path}: ${text.slice(0, 250)}`);
  checks++;
  return { response, text, json: () => JSON.parse(text) };
}

const dashboard = await request('/admin');
assert.match(dashboard.text, /Website content/);
assert.match(dashboard.text, /Team profiles/);
assert.match(dashboard.text, /Files/);
assert.doesNotMatch(dashboard.text, /href="\/admin\/team"/);
await request('/admin/content');
await request('/admin/content/home');
await request('/admin/content/team');
await request('/admin/files');
const preview = await request('/admin/preview/home');
assert.match(preview.text, /Visible only to approved editors/);

const original = (await request('/api/admin/content/home')).json().record;
await request('/api/admin/assets');
const saved = (await request('/api/admin/content/home', {
  method: 'PATCH',
  json: { action: 'save', revision: original.revision, draft: original.draft },
})).json().record;
assert.equal(saved.revision, original.revision + 1);
assert.deepEqual(saved.draft, original.draft);

await request('/api/admin/assets', {
  method: 'POST',
  body: 'not a valid PDF',
  extraHeaders: { 'Content-Type': 'application/octet-stream', 'X-File-Name': 'invalid.pdf' },
  status: 400,
});
await request('/admin/team', { status: 307 });
await request('/api/admin/team', {
  method: 'PATCH',
  json: { userId: 'someone_else', status: 'approved' },
  status: 403,
});

console.log(`PASS: ${checks} approved-editor checks across website pages, previews, files and owner-only access.`);

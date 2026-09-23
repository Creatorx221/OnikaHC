import assert from 'node:assert/strict';

// Run only against the loopback Sites development server with its local owner fixture.
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Tests must run locally.');

let cookie = '';
let checks = 0;

async function req(path, { method = 'GET', json, body, headers = {}, auth = true, status = 200 } = {}) {
  const r = await fetch(origin + path, {
    method,
    headers: {
      ...(auth && cookie ? { Cookie: cookie } : {}),
      ...(method !== 'GET' ? { Origin: origin } : {}),
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
    redirect: 'manual',
  });
  const text = await r.text();
  assert.equal(r.status, status, `${method} ${path}: ${text.slice(0, 250)}`);
  checks++;
  return {
    r,
    text,
    data: () => JSON.parse(text),
  };
}

console.log('--- Starting Heuresis Website & Publishing Backend Verification ---');

// 1. Authentication & Session Setup
const login = await req('/signin-with-chatgpt?return_to=%2Fadmin', { status: 302, auth: false });
cookie = login.r.headers.get('set-cookie').split(';')[0];
const session = (await req('/api/admin/session')).data();
assert.equal(session.userId, 'local_seedy');
await req('/api/admin/content/home');
console.log('PASS: Authenticated as local owner fixture.');

// 2. Anonymous / Protected Endpoint Boundaries
await req('/api/admin/content/home', { auth: false, status: 401 });
await req('/api/admin/assets', { auth: false, status: 401 });
await req('/admin/preview/home', { auth: false, status: 307 }); // redirects to /admin
console.log('PASS: Unauthorized administrative endpoints rejected.');

// 3. Website Content: Draft Privacy & Publishing
const originalHome = (await req('/api/admin/content/home')).data().record;
const draftUpdate = {
  ...originalHome.draft,
  title: 'Test Dynamic Heading - ' + Date.now(),
};

// Save draft
const saveRes = await req('/api/admin/content/home', {
  method: 'PATCH',
  json: { draft: draftUpdate, revision: originalHome.revision, action: 'save' },
});
const savedRecord = saveRes.data().record;
assert.equal(savedRecord.draft.title, draftUpdate.title);

// Verify public homepage remains unchanged
const publicHomeBefore = await req('/', { auth: false });
assert.ok(!publicHomeBefore.text.includes(draftUpdate.title));
console.log('PASS: Saved draft changes remain private from public visitors.');

// Verify Preview Route displays the saved draft
const previewRes = await req('/admin/preview/home');
assert.ok(previewRes.text.includes('Saved draft preview'));
assert.ok(previewRes.text.includes(draftUpdate.title));
console.log('PASS: Preview route renders saved draft to authenticated owner.');

// Publish changes
await req('/api/admin/content/home', {
  method: 'PATCH',
  json: { draft: draftUpdate, revision: savedRecord.revision, action: 'publish' },
});

// Verify public homepage now shows published changes
const publicHomeAfter = await req('/', { auth: false });
assert.ok(publicHomeAfter.text.includes(draftUpdate.title));
console.log('PASS: Publishing updates the live public homepage.');

// Reset / Revert homepage
await req('/api/admin/content/home', {
  method: 'PATCH',
  json: { draft: originalHome.draft, revision: savedRecord.revision + 1, action: 'publish' },
});

// 4. Asset Management & Visible-Reference Access Auditing
// Upload test document asset
const assetUpload = await req('/api/admin/assets', {
  method: 'POST',
  headers: { 'X-File-Name': 'test-report.csv' },
  body: 'column,value\nlocal-test,1',
  status: 201,
});
const asset = assetUpload.data().asset;
assert.ok(asset.url.startsWith('/assets/'));

// Verify unreferenced asset returns 404 to anonymous visitors
await req(asset.url, { auth: false, status: 404 });
// But owner can access it
await req(asset.url, { auth: true, status: 200 });
console.log('PASS: Unreferenced asset is private by default.');

// Reference asset in Resources section with visible=false
const originalResources = (await req('/api/admin/content/resources')).data().record;
const draftDoc = {
  title: 'Test Public Document',
  description: 'A test description',
  category: 'Reports',
  file: asset.url,
  visible: false, // hidden document!
};

await req('/api/admin/content/resources', {
  method: 'PATCH',
  json: {
    draft: { ...originalResources.draft, visible: true, documents: [draftDoc] },
    revision: originalResources.revision,
    action: 'publish',
  },
});

// Because document is marked visible=false, asset should STILL be 404 to anonymous visitors
await req(asset.url, { auth: false, status: 404 });
console.log('PASS: Asset referenced in hidden document remains private.');

// Now set document visible=true and publish
draftDoc.visible = true;
const resRec = (await req('/api/admin/content/resources')).data().record;
await req('/api/admin/content/resources', {
  method: 'PATCH',
  json: {
    draft: { ...resRec.draft, visible: true, documents: [draftDoc] },
    revision: resRec.revision,
    action: 'publish',
  },
});

// Now asset must be accessible to public visitors
const pubAsset = await req(asset.url, { auth: false, status: 200 });
assert.match(pubAsset.r.headers.get('content-disposition'), /^attachment/);
assert.equal(pubAsset.r.headers.get('x-content-type-options'), 'nosniff');
console.log('PASS: Asset referenced in published visible document is public with safe download headers.');

// Revert resources
const resRecAfter = (await req('/api/admin/content/resources')).data().record;
await req('/api/admin/content/resources', {
  method: 'PATCH',
  json: { draft: originalResources.draft, revision: resRecAfter.revision, action: 'publish' },
});

// Verify asset becomes private again after removal from published version
await req(asset.url, { auth: false, status: 404 });
console.log('PASS: Asset becomes private immediately upon removal from published content.');
await req('/api/admin/assets', {
  method: 'PATCH', json: { id: asset.id, action: 'archive' },
});

// Team photos and biographies use the same draft/publish boundary as documents.
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+nrQcAAAAASUVORK5CYII=', 'base64');
async function photo(name) {
  return (await req('/api/admin/assets', {
    method: 'POST', headers: { 'X-File-Name': name }, body: pixel, status: 201,
  })).data().asset;
}
const photoOne = await photo('local-team-one.png');
const photoTwo = await photo('local-team-two.png');
const originalTeam = (await req('/api/admin/content/team')).data().record;
const memberOne = { name: 'Local Test One', role: 'Test researcher', bio: 'Local fixture only.', credentials: '', photo: photoOne.url, email: '', linkedin: '', visible: true };
const memberTwo = { name: 'Local Test Two', role: 'Test analyst', bio: 'Local fixture only.', credentials: '', photo: photoTwo.url, email: '', linkedin: '', visible: true };
let team = (await req('/api/admin/content/team', {
  method: 'PATCH', json: { draft: { ...originalTeam.draft, visible: true, members: [memberOne, memberTwo] }, revision: originalTeam.revision, action: 'save' },
})).data().record;
assert.ok(!(await req('/about', { auth: false })).text.includes(memberOne.name));
await req(photoOne.url, { auth: false, status: 404 });
const teamPreview = await req('/admin/preview/team');
assert.ok(teamPreview.text.includes(memberOne.name));
team = (await req('/api/admin/content/team', {
  method: 'PATCH', json: { draft: team.draft, revision: team.revision, action: 'publish' },
})).data().record;
let about = (await req('/about', { auth: false })).text;
assert.ok(about.indexOf(memberOne.name) < about.indexOf(memberTwo.name));
await req(photoOne.url, { auth: false, status: 200 });
await req(photoTwo.url, { auth: false, status: 200 });

const replacementPhoto = await photo('local-team-replacement.png');
team = (await req('/api/admin/content/team', {
  method: 'PATCH', json: {
    draft: { ...team.draft, members: [memberTwo, { ...memberOne, photo: replacementPhoto.url }] },
    revision: team.revision, action: 'save',
  },
})).data().record;
await req(photoOne.url, { auth: false, status: 200 });
await req(replacementPhoto.url, { auth: false, status: 404 });
team = (await req('/api/admin/content/team', {
  method: 'PATCH', json: { draft: team.draft, revision: team.revision, action: 'publish' },
})).data().record;
about = (await req('/about', { auth: false })).text;
assert.ok(about.indexOf(memberTwo.name) < about.indexOf(memberOne.name));
await req(photoOne.url, { auth: false, status: 404 });
await req(replacementPhoto.url, { auth: false, status: 200 });
team = (await req('/api/admin/content/team', {
  method: 'PATCH', json: { draft: originalTeam.draft, revision: team.revision, action: 'publish' },
})).data().record;
assert.ok(!(await req('/about', { auth: false })).text.includes(memberOne.name));
for (const item of [photoOne, photoTwo, replacementPhoto]) {
  await req(item.url, { auth: false, status: 404 });
  await req('/api/admin/assets', { method: 'PATCH', json: { id: item.id, action: 'archive' } });
}
console.log('PASS: Team draft privacy, photo publication, order, replacement and removal.');

// 5. Research Attachment Reordering, Replacement, and Archival
const testArticleDraft = {
  title: 'Attachment Lifecycle Test - ' + Date.now(),
  slug: 'test-lifecycle-' + Date.now(),
  summary: 'Testing attachment ordering and replace workflows.',
  type: 'Macro & Strategy',
  topics: ['Workflow'],
  author: 'Test Engineer',
  date: new Date().toISOString().slice(0, 10),
  takeaways: ['One', 'Two', 'Three'],
  sections: [{ id: 's-1', title: 'Test Section', paragraphs: ['Content paragraph.'] }],
  sources: [{ label: 'Source 1' }],
  disclosures: 'Disclosures.',
  materialIds: [],
  featured: false,
};

const post = (await req('/api/admin/research', { method: 'POST', json: { draft: testArticleDraft }, status: 201 })).data().post;

// Upload File A and File B
const fileA = (await req(`/api/admin/research/${post.id}/materials`, {
  method: 'POST',
  headers: { 'X-File-Name': 'file-a.csv' },
  body: 'id,name\n1,alpha',
  status: 201,
})).data().material;

const fileB = (await req(`/api/admin/research/${post.id}/materials`, {
  method: 'POST',
  headers: { 'X-File-Name': 'file-b.csv' },
  body: 'id,name\n2,beta',
  status: 201,
})).data().material;

// Save draft with [fileA, fileB] order
let articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { draft: { ...articleRec.draft, materialIds: [fileA.id, fileB.id] }, revision: articleRec.revision, action: 'publish' },
});

// Verify public article renders attachments in exact order
const publicArticle = await req(`/research/${testArticleDraft.slug}`, { auth: false });
const idxA = publicArticle.text.indexOf(fileA.name);
const idxB = publicArticle.text.indexOf(fileB.name);
assert.ok(idxA !== -1 && idxB !== -1);
assert.ok(idxA < idxB, 'File A must appear before File B');
console.log('PASS: Public research renders downloads in the exact draft-specified order.');

// Reorder [fileB, fileA] and verify
articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { draft: { ...articleRec.draft, materialIds: [fileB.id, fileA.id] }, revision: articleRec.revision, action: 'publish' },
});

const publicArticleReordered = await req(`/research/${testArticleDraft.slug}`, { auth: false });
const newIdxA = publicArticleReordered.text.indexOf(fileA.name);
const newIdxB = publicArticleReordered.text.indexOf(fileB.name);
assert.ok(newIdxB < newIdxA, 'File B must now appear before File A');
console.log('PASS: Attachment reordering persists and renders correctly in public view.');

// Saving a replacement draft must preserve the currently published file.
const fileC = (await req(`/api/admin/research/${post.id}/materials`, {
  method: 'POST', headers: { 'X-File-Name': 'file-c.csv' },
  body: 'id,name\n3,gamma', status: 201,
})).data().material;
articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { draft: { ...articleRec.draft, materialIds: [fileB.id, fileC.id] }, revision: articleRec.revision, action: 'save' },
});
await req(fileA.url, { auth: false, status: 200 });
await req(fileC.url, { auth: false, status: 404 });
articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { draft: articleRec.draft, revision: articleRec.revision, action: 'publish' },
});
await req(fileA.url, { auth: false, status: 404 });
await req(fileC.url, { auth: false, status: 200 });
console.log('PASS: Replacing a file preserves the old public version until publication.');

// Test archival of published reference rejection
await req(`/api/admin/research/${post.id}/materials`, {
  method: 'PATCH',
  json: { id: fileB.id, action: 'archive' },
  status: 409,
});
console.log('PASS: Rejection of archiving an attachment actively referenced by published research.');

// Clean up test post
articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { action: 'unpublish', revision: articleRec.revision, draft: articleRec.draft },
});
articleRec = (await req(`/api/admin/research/${post.id}`)).data().post;
await req(`/api/admin/research/${post.id}`, {
  method: 'PATCH',
  json: { action: 'archive', revision: articleRec.revision, draft: articleRec.draft },
});

console.log(`\nALL ${checks} WEBSITE & PUBLISHING BACKEND VERIFICATION CHECKS PASSED.`);

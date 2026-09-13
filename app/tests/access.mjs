import assert from 'node:assert/strict';
// Run with CMS_ADMIN_USER_IDS=local_owner_test in ignored .dev.vars.
const origin='http://localhost:3000';
const headers={Cookie:'__sites_local_auth=1',Origin:origin};
async function request(path,method,status,json){const r=await fetch(origin+path,{method,headers:{...headers,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(json):undefined});assert.equal(r.status,status,await r.text());}
await request('/api/admin/research','GET',403);
await request('/api/admin/team','POST',200);
await request('/api/admin/research','POST',403,{draft:{}});
await request('/api/admin/team','PATCH',403,{userId:'local_seedy',status:'approved'});
await request('/api/admin/research','GET',403);
console.log('PASS: signed-in visitor can request access but cannot self-approve, read drafts or publish.');

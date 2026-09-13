import assert from 'node:assert/strict';
// Run only against the loopback Sites development server with its local owner fixture.
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname),'Tests must run locally.');
let cookie='',checks=0;
async function req(path,{method='GET',json,body,headers={},auth=true,status=200}={}){
 const r=await fetch(origin+path,{method,headers:{...(auth&&cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:origin}:{}),...(json!==undefined?{'Content-Type':'application/json'}:{}),...headers},body:json!==undefined?JSON.stringify(json):body,redirect:'manual'});
 const text=await r.text();assert.equal(r.status,status,`${method} ${path}: ${text.slice(0,250)}`);checks++;return {r,text,data:()=>JSON.parse(text)};
}
await req('/api/admin/research',{auth:false,status:401});
await req('/api/admin/research',{auth:false,headers:{'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'},status:401});
assert.match((await req('/admin',{auth:false})).text,/Sign in with ChatGPT/);
const login=await req('/signin-with-chatgpt?return_to=%2Fadmin',{status:302});cookie=login.r.headers.get('set-cookie').split(';')[0];
assert.equal((await req('/api/admin/session')).data().userId,'local_seedy');await req('/api/admin/research');
const draft={title:'Local workflow verification',slug:'local-verification-'+Date.now(),summary:'A local integration test. Never deployed.',type:'Macro & Strategy',topics:['Testing'],author:'Local test',date:new Date().toISOString().slice(0,10),takeaways:['First','Second','Third'],sections:[{id:'section-1',title:'Analysis',paragraphs:['Original published paragraph.']}],sources:[{label:'Local fixture'}],disclosures:'Local test only.',materialIds:[],featured:false};
await req('/api/admin/research',{method:'POST',json:{draft},headers:{Origin:'https://example.org'},status:403});
await req('/api/admin/research',{method:'POST',json:null,status:400});
await req('/api/admin/research',{method:'POST',json:{draft:{...draft,slug:'Bad Slug'}},status:400});
await req('/api/admin/research',{method:'POST',json:{draft:{...draft,sources:[{label:'bad',url:'javascript:alert(1)'}]}},status:400});
let p=(await req('/api/admin/research',{method:'POST',json:{draft},status:201})).data().post;
const endpoint='/api/admin/research/'+p.id,article='/research/'+draft.slug;
async function update(action,d=p.draft,status=200){const result=await req(endpoint,{method:'PATCH',json:{action,revision:p.revision,draft:d},status});if(status===200)p=result.data().post;return result;}
await req('/api/admin/research',{method:'POST',json:{draft},status:409});
await req(endpoint,{auth:false,status:401});await req(article,{auth:false,status:404});
await update('publish',{...draft,takeaways:[]},400);
await req(endpoint+'/materials',{method:'POST',headers:{'X-File-Name':'unsafe.html'},body:'<html>bad</html>',status:400});
await req(endpoint+'/materials',{method:'POST',headers:{'X-File-Name':'fake.pdf'},body:'not a pdf',status:400});
const file=(await req(endpoint+'/materials',{method:'POST',headers:{'X-File-Name':'support.csv'},body:'series,value\nTest,1',status:201})).data().material;
await req(file.url,{auth:false,status:404});await req(file.url);
await update('save',{...draft,materialIds:[file.id]});
await update('publish');
let live=await req(article,{auth:false});assert.match(live.text,/Original published paragraph/);assert.ok(live.text.includes(file.url));
const download=await req(file.url,{auth:false});assert.match(download.r.headers.get('content-disposition'),/^attachment/);assert.equal(download.r.headers.get('x-content-type-options'),'nosniff');assert.match(download.text,/Test,1/);
const publishedRevision=p.revision;
await update('save',{...p.draft,sections:[{id:'section-1',title:'Analysis',paragraphs:['Private updated paragraph.']}]});
live=await req(article,{auth:false});assert.match(live.text,/Original published paragraph/);assert.ok(!live.text.includes('Private updated paragraph.'));
await req(endpoint,{method:'PATCH',json:{action:'save',revision:publishedRevision,draft:p.draft},status:409});
await update('publish');assert.match((await req(article,{auth:false})).text,/Private updated paragraph/);
await update('unpublish');await req(article,{auth:false,status:404});await req(file.url,{auth:false,status:404});
await update('save',{...p.draft,materialIds:['not-my-file']},400);
await update('archive');await update('save',p.draft,400);await update('restore');assert.equal(p.status,'draft');await update('archive');
console.log(`PASS: ${checks} publishing, authentication, validation and file privacy requests. Local fixture archived.`);


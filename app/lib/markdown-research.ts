import type {Research} from './research';
// Vite bundles these server-side; source Markdown is not copied to public assets.
const documents=import.meta.glob('../content/reports/*.md',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
export function readMarkdownResearch():Research[]{
 return Object.entries(documents).map(([path,raw])=>{
  const match=raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if(!match)throw new Error('Missing JSON front matter: '+path);
  const meta=JSON.parse(match[1]) as Partial<Research>;
  const sections=match[2].split(/^## /m).filter(v=>v.trim()).map((block,i)=>{
   const [title,...body]=block.trim().split('\n');return {id:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'section-'+i,title,paragraphs:body.join('\n').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)};
  });
  if(!meta.title||!meta.slug||!meta.summary||!meta.type||!['draft','sample','published'].includes(meta.status||''))throw new Error('Incomplete report metadata: '+path);
  if(meta.status==='published'&&(!meta.author||!meta.date||!meta.disclosures||!meta.sources?.length||meta.takeaways?.length!==3))throw new Error('Published research requires author, date, disclosures, sources and three takeaways: '+path);
  const words=sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length;
  return {...meta,sections,topics:meta.topics||[],companies:meta.companies||[],takeaways:meta.takeaways||[],sources:meta.sources||[],disclosures:meta.disclosures||'',readingMinutes:meta.readingMinutes||Math.max(1,Math.ceil(words/220))} as Research;
 });
}

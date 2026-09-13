import type {Research} from './research';
export function filterResearch(items:Research[],q='',type='',topic=''){
 const words=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return items.filter(r=>(!type||r.type===type)&&(!topic||r.topics.includes(topic))&&words.every(w=>[r.title,r.summary,...r.topics,...r.companies,...(r.tickers||[])].join(' ').toLowerCase().includes(w)));
}

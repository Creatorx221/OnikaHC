import type {Material} from './cms-types';
export type Research = {
 title:string;slug:string;summary:string;type:string;topics:string[];sector?:string;region?:string;
 companies:string[];tickers?:string[];author?:string;date?:string;updated?:string;readingMinutes:number;
 pdf?:string;materials?:Material[];sources:{label:string;url?:string}[];disclosures:string;featured?:boolean;
 status:'draft'|'sample'|'published';sampleOrder?:number;takeaways:string[];
 sections:{id:string;title:string;paragraphs:string[];chart?:boolean}[];
};
export function filterResearch(items:Research[],q='',type='',topic=''){
 const words=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return items.filter(r=>(!type||r.type===type)&&(!topic||r.topics.includes(topic))&&words.every(w=>[r.title,r.summary,...r.topics,...r.companies,...(r.tickers||[])].join(' ').toLowerCase().includes(w)));
}

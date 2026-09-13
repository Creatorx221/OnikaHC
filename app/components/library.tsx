'use client';
import {useState,useEffect} from 'react';
import {Search,ArrowDown,ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription} from '@/components/ui/empty';
import {ResearchRow} from './site';
import type {Research} from '@/lib/research';
import {filterResearch} from '@/lib/filter-research';
export function Choice({id,label,value,onChange,options}:{id:string;label:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string}[]}){
 return <div className="filter-field"><label id={id+'-label'} htmlFor={id}>{label}</label><Select value={value} onValueChange={v=>onChange(v||'all')} items={options}><SelectTrigger id={id} aria-labelledby={id+'-label'} className="filter-select"><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>;
}
export function Library({items,initial}:{items:Research[];initial:{q:string;type:string;topic:string}}){
 const[q,setQ]=useState(initial.q),[type,setType]=useState(initial.type),[topic,setTopic]=useState(initial.topic),[limit,setLimit]=useState(4);
 useEffect(()=>{function sync(){const s=new URLSearchParams(location.search);setQ(s.get('q')||'');setType(s.get('type')||'');setTopic(s.get('topic')||'');setLimit(4);}window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
 function change(key:string,value:string){const next={q,type,topic,[key]:value};setQ(next.q);setType(next.type);setTopic(next.topic);setLimit(4);const p=new URLSearchParams();Object.entries(next).forEach(([k,v])=>{if(v)p.set(k,v);});history.replaceState(null,'','/research'+(p.size?'?'+p.toString():''));}
 function reset(){setQ('');setType('');setTopic('');setLimit(4);history.replaceState(null,'','/research');}
 const results=filterResearch(items,q,type,topic),types=[...new Set(items.map(r=>r.type))],topics=[...new Set(items.flatMap(r=>r.topics))].sort();
 return <div className="library"><div className="filters"><div className="filter-field"><label htmlFor="research-search">Search research</label><div className="search-box"><Search size={18}/><input id="research-search" type="search" placeholder="Title, topic or company" value={q} onChange={e=>change('q',e.target.value)}/></div></div><Choice id="research-type" label="Research type" value={type||'all'} onChange={v=>change('type',v==='all'?'':v)} options={[{value:'all',label:'All research'},...[...new Set([...types,...(type?[type]:[])])].map(v=>({value:v,label:v}))]}/><Choice id="research-topic" label="Topic" value={topic||'all'} onChange={v=>change('topic',v==='all'?'':v)} options={[{value:'all',label:'All topics'},...[...new Set([...topics,...(topic?[topic]:[])])].map(v=>({value:v,label:v}))]}/></div>
 <div className="results-bar"><span role="status" aria-live="polite">{results.length} {results.length===1?'result':'results'}{results.length>limit?' · Showing '+limit:''}</span><div>{(q||type||topic)&&<button className="plain-button" onClick={reset}>Reset filters</button>}<span>{items.some(r=>r.date)?'Newest first':'Illustrative preview order'}</span></div></div>
 {results.length?results.slice(0,limit).map(r=><ResearchRow key={r.slug} report={r}/>):<Empty className="editorial-empty"><EmptyHeader><EmptyTitle><h3>{items.length?'A different question may find more.':'Our first publications are in preparation.'}</h3></EmptyTitle><EmptyDescription>{items.length?'Try another keyword or broaden your filters.':'Explore the purpose behind Heuresis while we prepare our first research.'}</EmptyDescription></EmptyHeader>{items.length?<button className="button" onClick={reset}>Clear search and filters</button>:<Link className="text-link" href="/about">About Heuresis <ArrowRight size={16}/></Link>}</Empty>}
 {results.length>limit&&<div className="load-more"><button className="button" onClick={()=>setLimit(n=>n+4)}>Load more research <ArrowDown size={17}/></button></div>}</div>;
}

export const dynamic='force-dynamic';
import {site} from '@/lib/site-config';
import {getResearch} from '@/lib/research-server';
import {SectionLabel} from '@/components/site';
import {Library} from '@/components/library';
export const metadata={title:'Research library',description:'Explore research on companies, economies, fixed income and market themes.',alternates:{canonical:'/research'}};
export default async function ResearchPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const p=await searchParams;const val=(k:string)=>typeof p[k]==='string'?p[k] as string:'';
 return <main id="main" className="container"><div className="page-intro"><SectionLabel>The research library</SectionLabel><h1>Explore the thinking.</h1><p className="lead">Perspectives that look beneath the headline.<br/>Find a question, follow the evidence, form a clearer view.</p>{site.preview&&<div className="notice"><strong>Illustrative research.</strong> These six illustrative samples demonstrate the reading experience. They are not published research or current investment recommendations.</div>}</div><Library items={await getResearch()} initial={{q:val('q'),type:val('type'),topic:val('topic')}}/></main>;
}

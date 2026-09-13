import {notFound} from 'next/navigation';
import {site} from '@/lib/site-config';
import {policies} from '@/lib/policies';
import {SectionLabel} from '@/components/site';
function getPolicy(p:string){return Object.prototype.hasOwnProperty.call(policies,p)?policies[p as keyof typeof policies]:null;}
export async function generateMetadata({params}:{params:Promise<{policy:string}>}){const{policy}=await params,p=getPolicy(policy);return{title:p?.title||'Page not found',description:p?.intro,alternates:{canonical:'/'+policy},robots:site.preview||!site.policiesApproved?{index:false,follow:false}:{index:true,follow:true}};}
export default async function Policy({params}:{params:Promise<{policy:string}>}){const{policy}=await params,p=getPolicy(policy);if(!p||(!site.preview&&!site.policiesApproved))notFound();return <main id="main" className="container"><div className="policy"><div className="page-intro"><SectionLabel>{site.policiesApproved?'Website information':'Draft · Review required'}</SectionLabel><h1>{p.title}</h1><div className="notice">{p.intro}</div></div>{p.sections.map(([h,t])=><section key={h}><h2>{h}</h2><p>{t}</p></section>)}</div></main>;}


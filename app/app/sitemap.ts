export const dynamic='force-dynamic';
import {site} from '@/lib/site-config';
import {getResearch} from '@/lib/research-server';
export default async function sitemap(){if(site.preview)return[];return [...['','/research','/services','/about','/contact',...(site.policiesApproved?['/privacy','/terms','/research-disclosures']:[])].map(p=>({url:site.domain+p})),...(await getResearch()).filter(r=>r.status==='published').map(r=>({url:site.domain+'/research/'+r.slug,...(r.updated||r.date?{lastModified:r.updated||r.date}:{})}))];}

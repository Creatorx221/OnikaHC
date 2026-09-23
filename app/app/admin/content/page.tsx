import {redirect} from 'next/navigation';
import {requireEditor} from '@/lib/cms-auth';
import {contentRecords} from '@/lib/website-store';
import {definitions} from '@/lib/website-schema';
import {DeskHeader} from '@/components/research-desk';
export const dynamic='force-dynamic';
export default async function ContentHome(){try{await requireEditor(true);}catch{redirect('/admin');}const records=await contentRecords();return <><DeskHeader owner/><main id="main" className="container desk-main"><div className="desk-heading"><div><p className="eyebrow">Website management</p><h1>Website content</h1><p>Edit each section, preview a saved draft, then publish when ready.</p></div><a className="desk-secondary" href="/" target="_blank" rel="noopener noreferrer">View website</a></div><div className="cms-cards">{records.map(r=><a className="cms-card" href={'/admin/content/'+r.key} key={r.key}><span className="desk-status">{r.revision===0?'Current website':r.revision===r.publishedRevision?'Published':'Draft changes'}</span><h2>{definitions[r.key].title}</h2><p>{definitions[r.key].description}</p><span className="text-link">Edit section →</span></a>)}</div></main></>;}

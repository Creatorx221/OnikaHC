'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight, Mail} from 'lucide-react';
import {brand} from '@/lib/brand';
import {Choice} from './library';

const enquiryTypes = [
 {value:'general',label:'General enquiry'},
 {value:'bespoke',label:'Bespoke research'},
 {value:'access',label:'Research access'},
];

export function EnquiryForm({initialType,initialTopic,policiesVisible}:{initialType:string;initialTopic:string;policiesVisible:boolean}){
 const [type,setType]=useState(initialType);
 const [draft,setDraft]=useState<{subject:string;body:string;href:string}|null>(null);
 function prepare(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const fields=new FormData(e.currentTarget);
  const value=(name:string)=>String(fields.get(name)||'').trim();
  const label=enquiryTypes.find(option=>option.value===type)?.label||'General enquiry';
  const subject=label+' — Heuresis Capital'+(value('topic')?' — '+value('topic'):'');
  const body=[
   'Hello Heuresis Capital,','',value('message'),'',
   'Name: '+value('name'),'Email: '+value('email'),
   value('organisation')&&'Organisation: '+value('organisation'),
   type==='bespoke'&&value('topic')&&'Research topic: '+value('topic'),
   type==='bespoke'&&value('geography')&&'Geography: '+value('geography'),
   type==='bespoke'&&value('timing')&&'Desired timing: '+value('timing'),
  ].filter(line=>line!==false).join('\r\n');
  setDraft({subject,body,href:'mailto:'+brand.email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)});
 }
 return <form className="enquiry-form" onSubmit={prepare} onChange={()=>setDraft(null)}>
  <div className="enquiry-intro"><h2>Start with your question.</h2><p>Prepare your message below, then open it in your email app to review and send.</p></div>
  <div className="form-grid">
   <div className="form-field"><label htmlFor="name">Name</label><input name="name" id="name" autoComplete="name" required maxLength={120}/></div>
   <div className="form-field"><label htmlFor="email">Email address</label><input name="email" id="email" type="email" autoComplete="email" required maxLength={254}/></div>
   <div className="form-field form-wide"><label htmlFor="organisation">Organisation <span className="optional">(optional)</span></label><input name="organisation" id="organisation" autoComplete="organization" maxLength={160}/></div>
   <div className="form-wide"><Choice id="enquiry-type" label="Enquiry type" value={type} onChange={value=>{setType(value);setDraft(null);}} options={enquiryTypes}/></div>
   {type==='bespoke'&&<>
    <div className="form-field form-wide"><label htmlFor="topic">Research topic <span className="optional">(optional)</span></label><input name="topic" id="topic" defaultValue={initialTopic} placeholder="What would you like to understand?" maxLength={240}/></div>
    <div className="form-field"><label htmlFor="geography">Geography <span className="optional">(optional)</span></label><input name="geography" id="geography" maxLength={120}/></div>
    <div className="form-field"><label htmlFor="timing">Desired timing <span className="optional">(optional)</span></label><input name="timing" id="timing" maxLength={120}/></div>
   </>}
   <div className="form-field form-wide"><label htmlFor="message">Your message</label><textarea id="message" name="message" required minLength={10} maxLength={2000} placeholder="Tell us about the question, its context and what you need to understand."/></div>
  </div>
  <p className="small enquiry-note">Your details stay on this page until you choose to send the email. An enquiry does not subscribe you to marketing. {policiesVisible&&<Link href="/privacy">Privacy notice</Link>}</p>
  <button className="button" type="submit">Prepare email <ArrowUpRight size={17}/></button>
  {draft&&<section className="email-draft" aria-label="Prepared email"><p className="eyebrow" role="status">Your email draft is ready</p><p className="draft-recipient">To: <strong>{brand.email}</strong></p><h3>{draft.subject}</h3><pre>{draft.body}</pre><a className="button" href={draft.href}><Mail size={17}/>Open email app</a><p className="small">Nothing has been sent yet. Review and send in your email app, or copy this message into your webmail.</p></section>}
 </form>;
}


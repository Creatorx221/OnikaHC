import Link from '@/components/navigation';
import { WebsiteFrame } from '@/components/website-frame';
import { defaultWebsite } from '@/lib/website-schema';
export default function NotFound(){return <WebsiteFrame data={defaultWebsite()}><main id="main" className="container section"><div className="editorial-empty"><p className="eyebrow">Page not found</p><h1 style={{marginTop:20}}>A different direction.</h1><p>The page may be unpublished or the address may have changed.</p><Link className="button" href="/research">Explore research</Link></div></main></WebsiteFrame>;}

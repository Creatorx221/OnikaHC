import type { Metadata } from 'next';
import { site } from '@/lib/site-config';
import { Header, Footer } from '@/components/site';
import './globals.css';
export const metadata:Metadata={
 metadataBase:new URL(site.domain),
 title:{default:'Heuresis Capital | A clearer view of capital markets',template:'%s | Heuresis Capital'},
 description:'Considered perspectives on companies, economies and market themes.',
 robots:site.preview?{index:false,follow:false}:{index:true,follow:true},
 alternates:{canonical:'/'},
 openGraph:{siteName:site.name,type:'website',title:site.name,description:'A clearer view of capital markets.',url:site.domain},
 twitter:{card:'summary',title:site.name,description:'A clearer view of capital markets.'},
 icons:{icon:'/symbol.svg'},
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{site.preview&&<div className="preview-bar"><span className="preview-dot"/> PREVIEW EDITION <span className="preview-detail">Illustrative research · Heuresis Capital</span></div>}<Header/>{children}<Footer preview={site.preview} policiesVisible={site.preview||site.policiesApproved} contactEmail={site.contactEmail} social={site.social}/></body></html>;
}
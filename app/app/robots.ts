import {site} from '@/lib/site-config';
export default function robots(){return site.preview?{rules:{userAgent:'*',disallow:'/'}}:{rules:{userAgent:'*',allow:'/',disallow:['/api/',...(!site.policiesApproved?['/privacy','/terms','/research-disclosures']:[])]},sitemap:site.domain+'/sitemap.xml'};}

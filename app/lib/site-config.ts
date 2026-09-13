import { brand } from './brand';
// Central launch controls. Preview content is decided on the server, never by a query parameter.
export const site = {
 name:brand.name, domain:brand.domain,
 preview:process.env.SITE_MODE === 'preview',
 capabilitiesApproved:false, approachApproved:false, policiesApproved:false,
 legalEntity:null as string|null, jurisdiction:null as string|null, contactEmail:brand.email,
 newsletterReady:false, enquiriesReady:false,
 team:[] as {name:string;role:string;bio:string;photo?:string;credentials?:string[]}[],
 social:[] as {label:string;url:string}[]
};
export const capabilities = [
 {title:'Equities',type:'Equities',short:'The business behind the numbers.',question:'What drives the quality and durability of a company’s earnings?',deliverable:'Company analysis, earnings reviews and valuation scenarios.',audience:'Investment professionals, asset managers and serious individual investors.'},
 {title:'Macro & Strategy',type:'Macro & Strategy',short:'The forces shaping markets.',question:'How could inflation, policy and capital flows change the operating environment?',deliverable:'Economic perspectives, scenario analysis and market strategy notes.',audience:'Investment teams, family offices and treasury teams.'},
 {title:'Fixed Income',type:'Fixed Income',short:'A closer reading of risk and return.',question:'What do yields, duration and credit fundamentals reveal about financing conditions?',deliverable:'Credit analysis, yield-curve perspectives and financing-condition reviews.',audience:'Fixed income investors, corporate finance and treasury teams.'},
 {title:'Sectors & Themes',type:'Sectors & Themes',short:'Structural change. Lasting implications.',question:'Which structural shifts matter for a sector’s economics?',deliverable:'Sector studies, thematic reports and competitive landscape analysis.',audience:'Investors and corporate teams examining long-term change.'},
 {title:'Bespoke research',type:'Bespoke',short:'An analytical question, carefully scoped.',question:'What specific question would help your team reach a better-informed decision?',deliverable:'A format and scope agreed after an initial discussion.',audience:'Investment teams, family offices and corporate decision-makers.'},
];

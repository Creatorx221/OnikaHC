// Reusable content architecture. Publish profile/coverage routes only when genuine content is ready.
export type AuthorProfile={id:string;name:string;role:string;biography:string;credentials:string[];photo?:string;disclosures:string};
export type CompanyCoverage={id:string;name:string;tickers:string[];sector:string;region?:string;introduction:string;reportSlugs:string[];asOf:string};
export const authors:AuthorProfile[]=[];
export const companies:CompanyCoverage[]=[];

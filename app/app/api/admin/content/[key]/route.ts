import { requireEditor,requireSameOrigin,readJson,cmsResponse,cmsFailure } from '@/lib/cms-auth';
import { getContentRecord,updateContent } from '@/lib/website-store';
export const dynamic='force-dynamic';
export async function GET(_r:Request,{params}:{params:Promise<{key:string}>}){try{await requireEditor(true);return cmsResponse({record:await getContentRecord((await params).key)});}catch(e){return cmsFailure(e);}}
export async function PATCH(r:Request,{params}:{params:Promise<{key:string}>}){try{requireSameOrigin(r);const u=await requireEditor(true),d=await readJson(r);return cmsResponse({record:await updateContent((await params).key,d.draft,d.revision,d.action,u.userId)});}catch(e){return cmsFailure(e);}}

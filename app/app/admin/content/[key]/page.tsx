import {redirect,notFound} from 'next/navigation';
import {requireEditor} from '@/lib/cms-auth';
import {getContentRecord,listAssets} from '@/lib/website-store';
import {definitions} from '@/lib/website-schema';
import {ContentEditor} from '@/components/content-editor';
export const dynamic='force-dynamic';
export default async function EditContent({params}:{params:Promise<{key:string}>}){
  const user = await requireEditor().catch(() => redirect('/admin'));
  const {key} = await params;
  if(!Object.hasOwn(definitions,key)) notFound();
  const [record,assets] = await Promise.all([getContentRecord(key),listAssets()]);
  return <ContentEditor initial={record} initialAssets={assets} owner={user.owner}/>;
}

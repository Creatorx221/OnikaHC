import {redirect} from 'next/navigation';
import {requireEditor} from '@/lib/cms-auth';
import {listAssets} from '@/lib/website-store';
import {FileLibrary} from '@/components/content-editor';
export const dynamic='force-dynamic';
export default async function Files(){const user=await requireEditor().catch(()=>redirect('/admin'));return <FileLibrary initial={await listAssets()} owner={user.owner}/>;}

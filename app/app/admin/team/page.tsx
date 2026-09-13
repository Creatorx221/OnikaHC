import { redirect } from 'next/navigation';
import { requireEditor } from '@/lib/cms-auth';
import { listEditorRequests } from '@/lib/cms-store';
import { TeamAccess } from '@/components/research-desk';
export const dynamic = 'force-dynamic';
export default async function Team() {
  try {
    await requireEditor(true);
  } catch {
    redirect('/admin');
  }
  return <TeamAccess entries={await listEditorRequests()} />;
}

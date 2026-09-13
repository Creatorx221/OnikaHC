import { notFound, redirect } from 'next/navigation';
import { requireEditor } from '@/lib/cms-auth';
import { getEditorialPost } from '@/lib/cms-store';
import { ResearchEditor } from '@/components/research-editor';
export const dynamic = 'force-dynamic';
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let user;
  try {
    user = await requireEditor();
  } catch {
    redirect('/admin');
  }
  const post = id === 'new' ? null : await getEditorialPost(id);
  if (id !== 'new' && !post) notFound();
  return <ResearchEditor initial={post} author={user.displayName} />;
}

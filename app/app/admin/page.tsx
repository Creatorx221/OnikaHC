import Link from '@/components/navigation';
import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from '@/app/chatgpt-auth';
import { editorSession } from '@/lib/cms-auth';
import { listEditorialPosts } from '@/lib/cms-store';
import { DeskDashboard, AccessRequest } from '@/components/research-desk';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  const user = await getChatGPTUser();
  if (!user)
    return (
      <main id="main" className="container desk-login">
        <p className="eyebrow">Heuresis Capital · Research desk</p>
        <h1>A home for your research.</h1>
        <p>
          Edit and publish research, website pages, team profiles and files.
        </p>
        <a className="button" href={chatGPTSignInPath('/admin')} target="_top">
          Sign in with ChatGPT
        </a>
        <Link className="text-link" href="/research">
          View the public research library
        </Link>
      </main>
    );
  const session = await editorSession();
  if (!session?.editor)
    return (
      <main id="main" className="container desk-login">
        <p className="eyebrow">Research desk</p>
        <h1>Editorial access</h1>
        <p>
          You are signed in as {user.email}. Ask the site owner to approve your
          editorial access.
        </p>
        <AccessRequest requested={!!session?.requested} />
        <p className="small">
          Account identifier: <code>{user.userId}</code>
        </p>
        <a
          className="text-link"
          href={chatGPTSignOutPath('/admin')}
          target="_top"
        >
          Use another account
        </a>
      </main>
    );
  return (
    <DeskDashboard
      posts={await listEditorialPosts()}
      name={session.displayName}
      owner={session.owner}
    />
  );
}

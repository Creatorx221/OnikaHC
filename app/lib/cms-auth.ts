import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { CmsError } from './cms-validation';
export function isOwnerId(id: string) {
  return (env.CMS_ADMIN_USER_IDS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .includes(id);
}
export async function editorSession() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const owner = isOwnerId(user.userId);
  if (owner) return { ...user, owner: true, editor: true, requested: false };
  const row = await getDb()
    .prepare('SELECT status FROM editor_requests WHERE user_id = ?')
    .bind(user.userId)
    .first<{ status: string }>();
  return {
    ...user,
    owner: false,
    editor: row?.status === 'approved',
    requested: row?.status === 'pending',
  };
}
export async function requireEditor(ownerOnly = false) {
  const session = await editorSession();
  if (!session) throw new CmsError('Sign in to the research desk.', 401);
  if (!session.editor || (ownerOnly && !session.owner))
    throw new CmsError('Publishing access is required.', 403);
  return session;
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    throw new CmsError('This request must come from the research desk.', 403);
}
export async function readBytes(request: Request, limit: number) {
  const length = request.headers.get('content-length');
  if (length && Number(length) > limit)
    throw new CmsError('This request is too large.', 413);
  if (!request.body) throw new CmsError('The request is empty.');
  const reader = request.body.getReader(),
    parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new CmsError('This request is too large.', 413);
      }
      parts.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}
export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new CmsError('JSON is required.', 415);
  try {
    const data = JSON.parse(
      new TextDecoder().decode(await readBytes(request, 180000)),
    );
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new CmsError('A research record is required.');
    return data;
  } catch (error) {
    if (error instanceof CmsError) throw error;
    throw new CmsError('The research record could not be read.');
  }
}
export function cmsResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export function cmsFailure(error: unknown) {
  if (error instanceof CmsError)
    return cmsResponse({ error: error.message }, error.status);
  console.error('Research desk request failed', error);
  return cmsResponse(
    {
      error:
        'The research desk is temporarily unavailable. Your changes have not been confirmed; keep this page open and try again.',
    },
    503,
  );
}

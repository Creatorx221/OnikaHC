import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import {
  requireEditor,
  requireSameOrigin,
  readJson,
  cmsResponse,
  cmsFailure,
  isOwnerId,
} from '@/lib/cms-auth';
import { CmsError } from '@/lib/cms-validation';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await getChatGPTUser();
    if (!user) throw new CmsError('Sign in before requesting access.', 401);
    const now = new Date().toISOString();
    await getDb()
      .prepare(
        "INSERT INTO editor_requests (user_id,email,name,status,created_at,updated_at) VALUES (?,?,?,'pending',?,?) ON CONFLICT(user_id) DO NOTHING",
      )
      .bind(user.userId, user.email, user.displayName, now, now)
      .run();
    return cmsResponse({ requested: true });
  } catch (e) {
    return cmsFailure(e);
  }
}
export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const owner = await requireEditor(true),
      body = await readJson(request);
    if (
      typeof body.userId !== 'string' ||
      !['approved', 'revoked'].includes(body.status)
    )
      throw new CmsError('Invalid access change.');
    if (isOwnerId(body.userId))
      throw new CmsError('Owner access cannot be changed here.');
    const result = await getDb()
      .prepare(
        'UPDATE editor_requests SET status=?,updated_at=?,reviewed_by=? WHERE user_id=?',
      )
      .bind(body.status, new Date().toISOString(), owner.userId, body.userId)
      .run();
    if (result.meta.changes !== 1)
      throw new CmsError('Access request not found.', 404);
    return cmsResponse({ updated: true });
  } catch (e) {
    return cmsFailure(e);
  }
}

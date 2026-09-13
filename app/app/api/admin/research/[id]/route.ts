import {
  requireEditor,
  requireSameOrigin,
  readJson,
  cmsResponse,
  cmsFailure,
} from '@/lib/cms-auth';
import { getEditorialPost, updateEditorialPost } from '@/lib/cms-store';
import { CmsError, requireRevision } from '@/lib/cms-validation';
export const dynamic = 'force-dynamic';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireEditor();
    const post = await getEditorialPost((await params).id);
    if (!post) throw new CmsError('Research not found.', 404);
    return cmsResponse({ post });
  } catch (e) {
    return cmsFailure(e);
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireSameOrigin(request);
    const user = await requireEditor(),
      body = await readJson(request);
    return cmsResponse({
      post: await updateEditorialPost(
        (await params).id,
        body.draft,
        requireRevision(body.revision),
        body.action,
        user.userId,
      ),
    });
  } catch (e) {
    return cmsFailure(e);
  }
}

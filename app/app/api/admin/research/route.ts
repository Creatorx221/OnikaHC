import {
  requireEditor,
  requireSameOrigin,
  readJson,
  cmsResponse,
  cmsFailure,
} from '@/lib/cms-auth';
import { createEditorialPost, listEditorialPosts } from '@/lib/cms-store';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await requireEditor();
    return cmsResponse({ posts: await listEditorialPosts() });
  } catch (e) {
    return cmsFailure(e);
  }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireEditor(),
      body = await readJson(request);
    return cmsResponse(
      { post: await createEditorialPost(body.draft, user.userId) },
      201,
    );
  } catch (e) {
    return cmsFailure(e);
  }
}

import { getDb, getBucket } from '@/db';
import {
  requireEditor,
  requireSameOrigin,
  readBytes,
  cmsResponse,
  cmsFailure,
} from '@/lib/cms-auth';
import { postRow, postMaterials } from '@/lib/cms-store';
import { CmsError, inspectUpload, MAX_UPLOAD } from '@/lib/cms-validation';
export const dynamic = 'force-dynamic';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireSameOrigin(request);
    const user = await requireEditor(),
      postId = (await params).id,
      post = await postRow(postId);
    if (!post || post.status === 'archived')
      throw new CmsError('Save an active draft before uploading.', 404);
    if ((await postMaterials(postId)).length >= 40)
      throw new CmsError('This article already has 40 uploaded files.');
    let name: string;
    try {
      name = decodeURIComponent(request.headers.get('x-file-name') || '');
    } catch {
      throw new CmsError('Invalid filename.');
    }
    const bytes = await readBytes(request, MAX_UPLOAD),
      file = inspectUpload(name, bytes),
      id = crypto.randomUUID(),
      key = 'research/' + postId + '/' + id,
      now = new Date().toISOString();
    await getBucket().put(key, bytes, {
      httpMetadata: { contentType: file.mime },
    });
    try {
      await getDb()
        .prepare(
          'INSERT INTO research_materials (id,post_id,object_key,name,mime,size,created_at,uploaded_by) VALUES (?,?,?,?,?,?,?,?)',
        )
        .bind(
          id,
          postId,
          key,
          file.filename,
          file.mime,
          bytes.length,
          now,
          user.userId,
        )
        .run();
    } catch (error) {
      await getBucket()
        .delete(key)
        .catch(() => {});
      throw error;
    }
    return cmsResponse(
      {
        material: {
          id,
          postId,
          name: file.filename,
          mime: file.mime,
          size: bytes.length,
          createdAt: now,
          url: '/materials/' + id,
        },
      },
      201,
    );
  } catch (e) {
    return cmsFailure(e);
  }
}

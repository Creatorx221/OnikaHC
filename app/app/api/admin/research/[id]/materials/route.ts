import { getDb, getBucket } from '@/db';
import {
  requireEditor,
  requireSameOrigin,
  readBytes,
  readJson,
  cmsResponse,
  cmsFailure,
} from '@/lib/cms-auth';
import { postRow, postMaterials, fileRecord } from '@/lib/cms-store';
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
    if ((await postMaterials(postId)).filter((material) => !material.archived).length >= 40)
      throw new CmsError('This article already has 40 active uploaded files. Archive unused files before uploading more.');
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
          'INSERT INTO research_materials (id,post_id,object_key,name,mime,size,created_at,uploaded_by,archived) VALUES (?,?,?,?,?,?,?,?,0)',
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
          archived: 0,
        },
      },
      201,
    );
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
    await requireEditor();
    const postId = (await params).id,
      post = await postRow(postId);
    if (!post) throw new CmsError('Article not found.', 404);

    const body = await readJson(request);
    const materialId = typeof body.id === 'string' ? body.id : '';
    const action = typeof body.action === 'string' ? body.action : '';
    if (!materialId || !['archive', 'restore'].includes(action)) {
      throw new CmsError('Choose a file and a valid action.');
    }

    const material = await fileRecord(materialId);
    if (!material || material.post_id !== postId) {
      throw new CmsError('File not found for this article.', 404);
    }

    const desired = action === 'archive' ? 1 : 0;
    const changed = await getDb()
      .prepare(`UPDATE research_materials SET archived = ?
        WHERE id = ? AND post_id = ? AND
        (? = 0 OR NOT EXISTS (
          SELECT 1 FROM research_posts p WHERE p.id = ? AND (
            EXISTS (SELECT 1 FROM json_each(p.draft_json, '$.materialIds') WHERE value = ?)
            OR (p.status = 'published' AND p.published_json IS NOT NULL AND
              EXISTS (SELECT 1 FROM json_each(p.published_json, '$.materialIds') WHERE value = ?))
          )
        ))`)
      .bind(desired, materialId, postId, desired, postId, materialId, materialId)
      .run();
    if (changed.meta.changes !== 1) {
      throw new CmsError('This file is still selected in a saved draft or the published article. Remove it, save and publish any live change, then archive it.', 409);
    }

    return cmsResponse({ materials: await postMaterials(postId) });
  } catch (e) {
    return cmsFailure(e);
  }
}

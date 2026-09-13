import { getDb } from '@/db';
import type { Research } from './research';
import type {
  ResearchDraft,
  EditorialPost,
  Material,
  EditorRequest,
} from './cms-types';
import { CmsError, validateDraft, publicationIssues } from './cms-validation';
type Row = {
  id: string;
  slug: string;
  draft_json: string;
  published_json: string | null;
  status: EditorialPost['status'];
  revision: number;
  published_revision: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  updated_by: string;
};
type FileRow = {
  id: string;
  post_id: string;
  object_key: string;
  name: string;
  mime: string;
  size: number;
  created_at: string;
};
export const materialView = (r: FileRow): Material => ({
  id: r.id,
  postId: r.post_id,
  name: r.name,
  mime: r.mime,
  size: r.size,
  createdAt: r.created_at,
  url: '/materials/' + r.id,
});
export async function postRow(id: string) {
  return getDb()
    .prepare('SELECT * FROM research_posts WHERE id = ?')
    .bind(id)
    .first<Row>();
}
export async function postMaterials(id: string) {
  const r = await getDb()
    .prepare(
      'SELECT * FROM research_materials WHERE post_id = ? ORDER BY created_at DESC',
    )
    .bind(id)
    .all<FileRow>();
  return r.results.map(materialView);
}
function editorial(r: Row, materials: Material[] = []): EditorialPost {
  return {
    id: r.id,
    slug: r.slug,
    draft: JSON.parse(r.draft_json),
    status: r.status,
    revision: r.revision,
    publishedRevision: r.published_revision,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
    materials,
  };
}
export async function getEditorialPost(id: string) {
  const r = await postRow(id);
  return r ? editorial(r, await postMaterials(id)) : null;
}
export async function listEditorialPosts() {
  const r = await getDb()
    .prepare('SELECT * FROM research_posts ORDER BY updated_at DESC LIMIT 500')
    .all<Row>();
  return r.results.map((r) => editorial(r));
}
async function checkMaterials(postId: string, d: ResearchDraft) {
  if (!d.materialIds.length) return;
  const ids = new Set((await postMaterials(postId)).map((m) => m.id));
  if (d.materialIds.some((id) => !ids.has(id)))
    throw new CmsError(
      'One or more attachments do not belong to this article.',
    );
}
export async function createEditorialPost(input: unknown, userId: string) {
  const d = validateDraft(input);
  if (d.materialIds.length)
    throw new CmsError('Save the draft before adding attachments.');
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  try {
    await getDb()
      .prepare(
        "INSERT INTO research_posts (id,slug,draft_json,status,revision,created_at,updated_at,updated_by) VALUES (?,?,?,'draft',1,?,?,?)",
      )
      .bind(id, d.slug, JSON.stringify(d), now, now, userId)
      .run();
  } catch (error) {
    if (String(error).includes('UNIQUE'))
      throw new CmsError(
        'That web address is already in use. Choose another.',
        409,
      );
    throw error;
  }
  return (await getEditorialPost(id))!;
}
export async function updateEditorialPost(
  id: string,
  input: unknown,
  revision: number,
  action: string,
  userId: string,
) {
  const current = await postRow(id);
  if (!current) throw new CmsError('Research not found.', 404);
  if (current.revision !== revision)
    throw new CmsError(
      'Someone else updated this research. Keep your text, then reload before saving.',
      409,
    );
  if (!['save', 'publish', 'unpublish', 'archive', 'restore'].includes(action))
    throw new CmsError('Unknown research action.');
  if (current.status === 'archived' && action !== 'restore')
    throw new CmsError('Restore this article before editing.');
  const draft = ['save', 'publish'].includes(action)
    ? validateDraft(input)
    : (JSON.parse(current.draft_json) as ResearchDraft);
  if (draft.slug !== current.slug)
    throw new CmsError('The web address stays the same after the first save.');
  await checkMaterials(id, draft);
  let status = current.status,
    published = current.published_json,
    publishedRevision = current.published_revision,
    publishedAt = current.published_at;
  const nextRevision = revision + 1,
    now = new Date().toISOString();
  if (action === 'publish') {
    const issues = publicationIssues(draft);
    if (issues.length) throw new CmsError(issues.join(' '));
    status = 'published';
    published = JSON.stringify(draft);
    publishedRevision = nextRevision;
    publishedAt = now;
  }
  if (action === 'unpublish' || action === 'restore') {
    status = 'draft';
    published = null;
    publishedRevision = null;
  }
  if (action === 'archive') {
    status = 'archived';
    published = null;
    publishedRevision = null;
  }
  const result = await getDb()
    .prepare(
      'UPDATE research_posts SET draft_json=?,published_json=?,status=?,revision=?,published_revision=?,updated_at=?,published_at=?,updated_by=? WHERE id=? AND revision=?',
    )
    .bind(
      JSON.stringify(draft),
      published,
      status,
      nextRevision,
      publishedRevision,
      now,
      publishedAt,
      userId,
      id,
      revision,
    )
    .run();
  if (result.meta.changes !== 1)
    throw new CmsError(
      'Someone else updated this research. Keep your text, then reload before saving.',
      409,
    );
  return (await getEditorialPost(id))!;
}
export function asResearch(
  d: ResearchDraft,
  materials: Material[],
  updated?: string,
): Research {
  return {
    title: d.title,
    slug: d.slug,
    summary: d.summary,
    type: d.type,
    topics: d.topics,
    companies: [],
    author: d.author,
    date: d.date,
    updated: updated?.slice(0, 10),
    readingMinutes: Math.max(
      1,
      Math.ceil(
        d.sections
          .flatMap((s) => s.paragraphs)
          .join(' ')
          .split(/\s+/).length / 220,
      ),
    ),
    sources: d.sources,
    disclosures: d.disclosures,
    featured: d.featured,
    status: 'published',
    takeaways: d.takeaways,
    sections: d.sections,
    materials: materials.filter((m) => d.materialIds.includes(m.id)),
  };
}
export async function publicResearch() {
  const rows = await getDb()
    .prepare(
      "SELECT * FROM research_posts WHERE status='published' AND published_json IS NOT NULL ORDER BY published_at DESC",
    )
    .all<Row>();
  const files = await getDb()
    .prepare(
      "SELECT m.* FROM research_materials m JOIN research_posts p ON p.id=m.post_id WHERE p.status='published' AND p.published_json IS NOT NULL",
    )
    .all<FileRow>();
  return rows.results.map((r) =>
    asResearch(
      JSON.parse(r.published_json!),
      files.results.filter((f) => f.post_id === r.id).map(materialView),
      r.published_at || undefined,
    ),
  );
}
export async function fileRecord(id: string) {
  return getDb()
    .prepare('SELECT * FROM research_materials WHERE id=?')
    .bind(id)
    .first<FileRow>();
}
export async function fileIsPublic(id: string) {
  return !!(await getDb()
    .prepare(
      "SELECT m.id FROM research_materials m JOIN research_posts p ON p.id=m.post_id WHERE m.id=? AND p.status='published' AND p.published_json IS NOT NULL AND EXISTS (SELECT 1 FROM json_each(p.published_json,'$.materialIds') WHERE value=m.id)",
    )
    .bind(id)
    .first());
}
export async function listEditorRequests() {
  const r = await getDb()
    .prepare(
      'SELECT user_id AS userId,email,name,status,created_at AS createdAt FROM editor_requests ORDER BY created_at DESC',
    )
    .all<EditorRequest>();
  return r.results;
}

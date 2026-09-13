import type { ResearchDraft } from './cms-types';
import { researchTypes } from './cms-types';
export class CmsError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const record = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new CmsError('Invalid research record.');
  return v as Record<string, unknown>;
};
function text(v: unknown, max: number, label: string) {
  if (typeof v !== 'string' || v.length > max)
    throw new CmsError(label + ' is missing or too long.');
  return v.trim();
}
function list(v: unknown, max: number, label: string) {
  if (!Array.isArray(v) || v.length > max)
    throw new CmsError(label + ' has too many entries.');
  return v;
}
export function safeSourceUrl(value: string) {
  if (!value) return '';
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new CmsError('Enter a full source URL beginning with https://.');
  }
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password)
    throw new CmsError(
      'Source links must use http or https without passwords.',
    );
  return u.href;
}
export function validateDraft(input: unknown): ResearchDraft {
  const v = record(input);
  const title = text(v.title, 200, 'Title'),
    slug = text(v.slug, 100, 'Web address');
  if (!title) throw new CmsError('Give your research a title.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new CmsError(
      'Use lowercase words separated by hyphens for the web address.',
    );
  const type = text(v.type, 60, 'Research category');
  if (!researchTypes.includes(type))
    throw new CmsError('Choose a research category.');
  const date = text(v.date, 10, 'Publication date');
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)
  )
    throw new CmsError('Enter a valid publication date.');
  const sections = list(v.sections, 30, 'Article sections').map((s, i) => {
    const b = record(s);
    return {
      id: 'section-' + (i + 1),
      title: text(b.title, 180, 'Section heading'),
      paragraphs: list(b.paragraphs, 100, 'Paragraphs')
        .map((p) => text(p, 12000, 'Paragraph'))
        .filter(Boolean),
    };
  });
  const sources = list(v.sources, 40, 'Sources')
    .map((s) => {
      const b = record(s);
      return {
        label: text(b.label, 300, 'Source name'),
        url: safeSourceUrl(text(b.url ?? '', 2000, 'Source URL')),
      };
    })
    .filter((s) => s.label || s.url);
  const materialIds = list(v.materialIds, 20, 'Attachments').map((id) =>
    text(id, 80, 'Attachment'),
  );
  if (materialIds.some((id) => !/^[-a-zA-Z0-9]+$/.test(id)))
    throw new CmsError('Invalid attachment.');
  if (typeof v.featured !== 'boolean')
    throw new CmsError('Invalid featured selection.');
  return {
    title,
    slug,
    summary: text(v.summary, 1000, 'Summary'),
    type,
    topics: list(v.topics, 12, 'Topics')
      .map((t) => text(t, 80, 'Topic'))
      .filter(Boolean),
    author: text(v.author, 180, 'Author'),
    date,
    takeaways: list(v.takeaways, 3, 'Takeaways').map((t) =>
      text(t, 600, 'Takeaway'),
    ),
    sections,
    sources,
    disclosures: text(v.disclosures, 6000, 'Disclosures'),
    materialIds: [...new Set(materialIds)],
    featured: v.featured,
  };
}
export function publicationIssues(d: ResearchDraft) {
  const issues: string[] = [];
  if (!d.summary) issues.push('Add a summary.');
  if (!d.author) issues.push('Add the author.');
  if (!d.date) issues.push('Add the publication date.');
  if (d.date > new Date().toISOString().slice(0, 10))
    issues.push('Use today or an earlier publication date.');
  if (d.takeaways.length !== 3 || d.takeaways.some((t) => !t.trim()))
    issues.push('Complete all three key takeaways.');
  if (
    !d.sections.length ||
    d.sections.some((s) => !s.title || !s.paragraphs.length)
  )
    issues.push('Complete each section heading and its text.');
  if (!d.sources.length || d.sources.some((s) => !s.label))
    issues.push('Name at least one source, and name every source listed.');
  if (!d.disclosures)
    issues.push('Add the research disclosures and limitations.');
  return issues;
}
export function requireRevision(v: unknown) {
  if (!Number.isSafeInteger(v) || Number(v) < 1)
    throw new CmsError('Reload the record before saving.');
  return Number(v);
}
export const MAX_UPLOAD = 10 * 1024 * 1024;
export function inspectUpload(name: string, bytes: Uint8Array) {
  const filename = Array.from(name, (c) =>
    c.charCodeAt(0) < 32 || c === '/' || c === '\\' ? '_' : c,
  )
    .join('')
    .slice(0, 180);
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  if (!ext || !types[ext] || !bytes.length || bytes.length > MAX_UPLOAD)
    throw new CmsError(
      'Choose a PDF, Office document, CSV, PNG or JPEG up to 10 MB.',
    );
  const match = (sig: number[]) => sig.every((n, i) => bytes[i] === n);
  if (ext === 'pdf' && !match([37, 80, 68, 70, 45]))
    throw new CmsError('This file is not a valid PDF.');
  if (ext === 'png' && !match([137, 80, 78, 71, 13, 10, 26, 10]))
    throw new CmsError('This file is not a valid PNG.');
  if (['jpg', 'jpeg'].includes(ext) && !match([255, 216, 255]))
    throw new CmsError('This file is not a valid JPEG.');
  if (['xlsx', 'docx', 'pptx'].includes(ext) && !match([80, 75, 3, 4]))
    throw new CmsError('This file is not a valid Office document.');
  if (ext === 'csv') {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new CmsError('CSV files must use UTF-8 text.');
    }
  }
  return { filename, mime: types[ext] };
}

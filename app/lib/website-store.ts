import { cache } from 'react';
import { getDb } from '@/db';
import { brand } from './brand';
import { CmsError } from './cms-validation';
import { definitions, defaultWebsite, assetIds, translatableField, value, type Content, type Field } from './website-schema';

type ContentRow = {
  key: string;
  draft_json: string;
  published_json: string | null;
  revision: number;
  published_revision: number | null;
  updated_at: string;
  updated_by: string;
};

export type ContentRecord = {
  key: string;
  draft: Content;
  revision: number;
  publishedRevision: number | null;
  updatedAt: string | null;
};

export type Asset = {
  id: string;
  name: string;
  mime: string;
  size: number;
  archived: number;
  created_at: string;
  object_key: string;
};

export function contentDefinition(key: string) {
  const d = Object.hasOwn(definitions, key) ? definitions[key] : null;
  if (!d) throw new CmsError('Page not found.', 404);
  return d;
}

export async function getContentRecord(key: string): Promise<ContentRecord> {
  const d = contentDefinition(key);
  const r = await getDb()
    .prepare('SELECT * FROM website_content WHERE key=?')
    .bind(key)
    .first<ContentRow>();
  return r
    ? {
        key,
        draft: key === 'settings' ? normalizeSettings(JSON.parse(r.draft_json)) : JSON.parse(r.draft_json),
        revision: r.revision,
        publishedRevision: r.published_revision,
        updatedAt: r.updated_at,
      }
    : {
        key,
        draft: structuredClone(d.defaults),
        revision: 0,
        publishedRevision: null,
        updatedAt: null,
      };
}

function normalizeSettings(data: Content): Content {
  const social = Array.isArray(data.social) ? data.social as Content[] : [];
  return { ...data, social: social.map((entry) => ({
    platform: value(entry, 'platform') || value(entry, 'label'),
    handle: value(entry, 'handle') || value(entry, 'label'),
    url: value(entry, 'url'),
    visible: entry.visible !== false,
  })) };
}

export const publicWebsite = cache(async () => {
  const data = defaultWebsite();
  const r = await getDb()
    .prepare('SELECT key,published_json FROM website_content WHERE published_json IS NOT NULL')
    .all<Pick<ContentRow, 'key' | 'published_json'>>();

  for (const row of r.results) {
    if (Object.hasOwn(data, row.key)) {
      try {
        const parsed = JSON.parse(row.published_json!);
        data[row.key] = { ...data[row.key], ...parsed };
      } catch {
        // preserve default
      }
    }
  }

  // Sanitize public payload to prevent leaking hidden draft or archived content
  if (data.team) {
    if (data.team.visible === false) {
      data.team = { visible: false, members: [], eyebrow: '', title: '', intro: '' };
    } else if (Array.isArray(data.team.members)) {
      data.team.members = (data.team.members as Content[]).filter((m) => m.visible !== false);
    }
  }

  if (data.resources) {
    if (data.resources.visible === false) {
      data.resources = { visible: false, documents: [], eyebrow: '', title: '', intro: '' };
    } else if (Array.isArray(data.resources.documents)) {
      data.resources.documents = (data.resources.documents as Content[]).filter((d) => d.visible !== false);
    }
  }

  if (data.services) {
    if (data.services.visible === false) {
      data.services = { visible: false, items: [], eyebrow: '', title: '', intro: '', emptyTitle: data.services.emptyTitle, emptyIntro: data.services.emptyIntro };
    } else if (Array.isArray(data.services.items)) {
      data.services.items = (data.services.items as Content[]).filter((s) => s.visible !== false);
    }
  }

  if (data.approach?.visible === false) {
    data.approach = { visible: false, sections: [], eyebrow: '', title: '', intro: '' };
  }
  if (data.newsletter?.visible === false) {
    data.newsletter = { visible: false, eyebrow: '', title: '', intro: '', cardTitle: '', cardIntro: '', button: '', subject: '' };
  }
  for (const key of ['privacy', 'terms', 'research-disclosures']) {
    if (data[key]?.visible === false) {
      data[key] = { visible: false, title: '', intro: '', sections: [] };
    }
  }
  if (data.settings) {
    data.settings.navigation = Array.isArray(data.settings.navigation)
      ? data.settings.navigation.filter((n) => n.visible !== false)
      : [];
  }

  return data;
});

export async function contentRecords() {
  return Promise.all(Object.keys(definitions).map(getContentRecord));
}

function validLink(v: string) {
  if (!v) return true;
  if (v.startsWith('/') && !v.startsWith('//') && !/[\\\u0000-\u0020]/.test(v))
    return true;
  try {
    const u = new URL(v);
    return ['https:', 'mailto:', 'tel:'].includes(u.protocol) && !u.username && !u.password;
  } catch {
    return false;
  }
}

function validateFields(input: unknown, fields: Field[], path = ''): Content {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new CmsError('Invalid page content.');
  const source = input as Record<string, unknown>,
    out: Content = {};
  for (const f of fields) {
    const v = source[f.key],
      label = path + f.label;
    if (f.type === 'list') {
      if (!Array.isArray(v) || v.length > (f.max || 30))
        throw new CmsError(label + ' has too many entries.');
      out[f.key] = v.map((x) => validateFields(x, f.fields || [], label + ': '));
    } else if (f.type === 'toggle') {
      if (typeof v !== 'boolean') throw new CmsError(label + ' must be on or off.');
      out[f.key] = v;
    } else {
      if (typeof v !== 'string' || v.length > (f.type === 'textarea' ? 20000 : 2000))
        throw new CmsError(label + ' is too long or invalid.');
      const s = v.trim();
      if (f.type === 'url' && !validLink(s))
        throw new CmsError(label + ': use a website path, HTTPS, email or telephone link.');
      if (f.type === 'email' && s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
        throw new CmsError(label + ': enter a valid email address.');
      if (
        ['image', 'file'].includes(f.type || '') &&
        s &&
        !/^\/assets\/[a-f0-9-]{36}$/.test(s) &&
        !(f.type === 'image' && (s === '/logo-approved.png' || s === brand.logo))
      )
        throw new CmsError(label + ': choose an uploaded file.');
      out[f.key] = s;
      if (translatableField(f)) {
        for (const locale of ['fr', 'it'] as const) {
          const translated = source[`${f.key}_${locale}`];
          if (translated !== undefined && (typeof translated !== 'string' || translated.length > (f.type === 'textarea' ? 20000 : 2000)))
            throw new CmsError(label + ': translation is too long or invalid.');
          out[`${f.key}_${locale}`] = typeof translated === 'string' ? translated.trim() : '';
        }
      }
    }
  }
  return out;
}

export async function updateContent(
  key: string,
  input: unknown,
  revision: number,
  action: string,
  userId: string,
) {
  const definition = contentDefinition(key);
  if (!['save', 'publish', 'discard'].includes(action))
    throw new CmsError('Unknown page action.');
  const current = await getDb()
    .prepare('SELECT * FROM website_content WHERE key=?')
    .bind(key)
    .first<ContentRow>();
  if ((current?.revision || 0) !== revision)
    throw new CmsError(
      'This page changed in another session. Copy any unsaved work, then reload.',
      409,
    );
  const data =
    action === 'discard'
      ? current?.published_json
        ? JSON.parse(current.published_json)
        : definition.defaults
      : validateFields(input, definition.fields);
  if (
    key === 'settings' &&
    (!data.name || !data.email || !/^#[0-9a-fA-F]{6}$/.test(String(data.accent)))
  )
    throw new CmsError('Add the company name, contact email and a colour such as #9C8552.');
  if (key === 'settings' && action === 'publish') {
    for (const profile of (data.social || []) as Content[]) {
      if (profile.visible === false) continue;
      if (!value(profile, 'platform').trim() || !value(profile, 'handle').trim() || !/^https:\/\/[^\s/]+/i.test(value(profile, 'url')))
        throw new CmsError('Each visible social profile needs a platform, handle and full HTTPS link.');
    }
  }
  for (const id of assetIds(data)) {
    const a = await getAsset(id);
    if (!a || a.archived)
      throw new CmsError(
        'A selected file is archived or missing. Restore it or choose another file.',
      );
  }
  function checkImages(d: Content, fields: Field[]) {
    for (const f of fields) {
      if (f.type === 'image' && String(d[f.key]).startsWith('/assets/'))
        images.push(String(d[f.key]).slice(8));
      if (f.type === 'list')
        for (const item of (d[f.key] || []) as Content[])
          checkImages(item, f.fields || []);
    }
  }
  const images: string[] = [];
  checkImages(data, definition.fields);
  for (const id of images) {
    if (!(await getAsset(id))?.mime.startsWith('image/'))
      throw new CmsError('Choose a PNG or JPEG file for photos and logos.');
  }
  const now = new Date().toISOString(),
    next = revision + 1,
    json = JSON.stringify(data),
    pub = action === 'publish' ? json : current?.published_json || null,
    pubRevision =
      action === 'publish' ? next : current?.published_revision || null;
  let changed: number | undefined;
  if (current) {
    const r = await getDb()
      .prepare(
        'UPDATE website_content SET draft_json=?,published_json=?,revision=?,published_revision=?,updated_at=?,updated_by=? WHERE key=? AND revision=?',
      )
      .bind(json, pub, next, pubRevision, now, userId, key, revision)
      .run();
    changed = r.meta.changes;
  } else {
    const r = await getDb()
      .prepare(
        'INSERT OR IGNORE INTO website_content (key,draft_json,published_json,revision,published_revision,updated_at,updated_by) VALUES (?,?,?,?,?,?,?)',
      )
      .bind(key, json, pub, next, pubRevision, now, userId)
      .run();
    changed = r.meta.changes;
  }
  if (changed !== 1)
    throw new CmsError('This page changed in another session. Reload before saving.', 409);
  return getContentRecord(key);
}

export async function getAsset(id: string) {
  return getDb().prepare('SELECT * FROM website_assets WHERE id=?').bind(id).first<Asset>();
}

export async function listAssets() {
  const r = await getDb()
    .prepare('SELECT * FROM website_assets ORDER BY created_at DESC LIMIT 1000')
    .all<Asset>();
  const rows = await getDb()
    .prepare('SELECT key,draft_json,published_json FROM website_content')
    .all<Pick<ContentRow, 'key' | 'draft_json' | 'published_json'>>();
  return r.results.map((a) => ({
    ...a,
    url: '/assets/' + a.id,
    usedBy: rows.results
      .filter(
        (d) =>
          assetIds(JSON.parse(d.draft_json)).includes(a.id) ||
          assetIds(d.published_json ? JSON.parse(d.published_json) : {}).includes(a.id),
      )
      .map((d) => definitions[d.key]?.title || d.key),
  }));
}

export async function assetIsPublic(id: string): Promise<boolean> {
  const asset = await getAsset(id);
  if (!asset || asset.archived) return false;

  const r = await getDb()
    .prepare('SELECT key, published_json FROM website_content WHERE published_json IS NOT NULL')
    .all<{ key: string; published_json: string }>();

  for (const row of r.results) {
    try {
      const data = JSON.parse(row.published_json) as Content;
      if (!data) continue;

      // Check section-level visibility
      if (row.key === 'team') {
        if (data.visible === false) continue;
        const members = Array.isArray(data.members) ? (data.members as Content[]) : [];
        for (const m of members) {
          if (m.visible === false) continue;
          if (m.photo === '/assets/' + id) return true;
        }
        continue;
      }

      if (row.key === 'resources') {
        if (data.visible === false) continue;
        const docs = Array.isArray(data.documents) ? (data.documents as Content[]) : [];
        for (const d of docs) {
          if (d.visible === false) continue;
          if (d.file === '/assets/' + id) return true;
        }
        continue;
      }

      if (row.key === 'services' && data.visible === false) continue;
      if (row.key === 'approach' && data.visible === false) continue;
      if (row.key === 'newsletter' && data.visible === false) continue;

      if (
        (row.key.startsWith('privacy') ||
          row.key.startsWith('terms') ||
          row.key.startsWith('research-disclosures')) &&
        data.visible === false
      ) {
        continue;
      }

      // General fallback check across visible section fields
      const ids = assetIds(data);
      if (ids.includes(id)) return true;
    } catch {
      continue;
    }
  }

  return false;
}

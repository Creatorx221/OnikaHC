'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  Eye,
  Upload,
  FileText,
} from 'lucide-react';
import { DeskHeader } from './research-desk';
import {
  definitions,
  emptyFields,
  value,
  type Field,
  type Content,
} from '@/lib/website-schema';
import type { ContentRecord } from '@/lib/website-store';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';

export type AssetOption = {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  archived: number;
  created_at: string;
  usedBy: string[];
};

interface ApiError {
  error?: string;
}

async function jsonResponse<T>(r: Response): Promise<T> {
  const type = r.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw Error(
      r.status === 413
        ? 'The upload is too large. Choose a file up to 10 MB.'
        : 'The session or connection expired. Keep your work, sign in again in another tab, then retry.',
    );
  }
  const d = (await r.json()) as (T & ApiError) | null;
  if (!d || typeof d !== 'object') {
    throw Error('Invalid server response.');
  }
  if (!r.ok) {
    const message =
      'error' in d && typeof d.error === 'string' && d.error
        ? d.error
        : 'The change could not be saved.';
    throw Error(message);
  }
  return d as T;
}

export async function uploadAsset(file: File): Promise<AssetOption> {
  if (file.size > 10 * 1024 * 1024) throw Error('Choose a file up to 10 MB.');
  const data = await jsonResponse<{ asset: AssetOption }>(
    await fetch('/api/admin/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(file.name),
      },
      body: file,
    }),
  );
  return data.asset;
}

function EditorFields({
  fields,
  data,
  onChange,
  assets,
  onUpload,
  prefix = 'page',
}: {
  fields: Field[];
  data: Content;
  onChange: (d: Content) => void;
  assets: AssetOption[];
  onUpload: (file: File, done: (url: string) => void) => void;
  prefix?: string;
}) {
  return (
    <>
      {fields.map((f) => {
        const id = prefix + '-' + f.key;
        const change = (v: Content[string]) =>
          onChange({ ...data, [f.key]: v });

        if (f.type === 'toggle') {
          return (
            <label className="cms-toggle" key={id}>
              <input
                type="checkbox"
                checked={data[f.key] === true}
                onChange={(e) => change(e.target.checked)}
              />
              {f.label}
            </label>
          );
        }

        if (f.type === 'list') {
          const rows = (data[f.key] || []) as Content[];
          return (
            <section className="cms-list" key={id}>
              <div className="cms-list-heading">
                <h3>{f.label}</h3>
                <span className="small">{rows.length} entries · top to bottom</span>
              </div>
              {rows.map((row, i) => (
                <section className="cms-item" key={id + '-' + i}>
                  <div className="cms-item-heading">
                    <strong>
                      {i + 1}.{' '}
                      {value(row, 'name') ||
                        value(row, 'title') ||
                        value(row, 'label') ||
                        f.label}
                    </strong>
                    <div className="cms-order">
                      <button
                        type="button"
                        className="desk-icon"
                        aria-label={`Move ${f.label} ${i + 1} up`}
                        disabled={i === 0}
                        onClick={() => {
                          const next = [...rows];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          change(next);
                        }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="desk-icon"
                        aria-label={`Move ${f.label} ${i + 1} down`}
                        disabled={i === rows.length - 1}
                        onClick={() => {
                          const next = [...rows];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          change(next);
                        }}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="desk-icon danger"
                        aria-label={`Remove ${f.label} ${i + 1}`}
                        onClick={() => change(rows.filter((_, n) => n !== i))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <EditorFields
                    fields={f.fields || []}
                    data={row}
                    onChange={(v) =>
                      change(rows.map((x, n) => (n === i ? v : x)))
                    }
                    assets={assets}
                    onUpload={onUpload}
                    prefix={id + '-' + i}
                  />
                </section>
              ))}
              <button
                type="button"
                className="desk-secondary"
                disabled={rows.length >= (f.max || 30)}
                onClick={() => change([...rows, emptyFields(f.fields || [])])}
              >
                <Plus size={16} />
                Add entry
              </button>
            </section>
          );
        }

        const current = value(data, f.key);

        if (f.type === 'image' || f.type === 'file') {
          const filtered = assets.filter(
            (a) => !a.archived && (f.type !== 'image' || a.mime.startsWith('image/')),
          );
          return (
            <div className="form-field cms-file-field" key={id}>
              <label htmlFor={id}>{f.label}</label>
              {f.type === 'image' && current && (
                <img
                  src={current}
                  alt={f.label + ' preview'}
                  className="cms-image-preview"
                />
              )}
              <select
                id={id}
                value={current}
                onChange={(e) => change(e.target.value)}
              >
                <option value="">No file selected</option>
                {f.type === 'image' && (
                  <option value="/logo-approved.png">
                    Approved Heuresis Capital logo
                  </option>
                )}
                {filtered.map((a) => (
                  <option key={a.id} value={a.url}>
                    {a.name}
                  </option>
                ))}
              </select>
              <label className="small" htmlFor={id + '-upload'}>
                {current ? 'Upload a replacement' : 'Upload a new file'} · up to 10 MB
              </label>
              <input
                id={id + '-upload'}
                type="file"
                accept={
                  f.type === 'image'
                    ? '.png,.jpg,.jpeg'
                    : '.pdf,.xlsx,.csv,.docx,.pptx,.png,.jpg,.jpeg'
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file, (url) => change(url));
                  e.target.value = '';
                }}
              />
              {current && (
                <a
                  className="text-link"
                  href={current}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open selected file
                </a>
              )}
              <p className="small">
                Replacement becomes public when you publish this page. The earlier
                file remains in Files until you archive it.
              </p>
            </div>
          );
        }

        return (
          <div className="form-field" key={id}>
            <label htmlFor={id}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={id}
                rows={4}
                value={current}
                maxLength={20000}
                onChange={(e) => change(e.target.value)}
              />
            ) : (
              <input
                id={id}
                type={f.type === 'email' ? 'email' : 'text'}
                value={current}
                maxLength={2000}
                placeholder={f.type === 'url' ? '/research or https://…' : undefined}
                onChange={(e) => change(e.target.value)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function ContentEditor({
  initial,
  initialAssets,
}: {
  initial: ContentRecord;
  initialAssets: AssetOption[];
}) {
  const [record, setRecord] = useState(initial);
  const [draft, setDraft] = useState(initial.draft);
  const [assets, setAssets] = useState(initialAssets);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<'publish' | 'discard' | null>(null);

  const definition = definitions[record.key];

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  async function save(action = 'save') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const d = await jsonResponse<{ record: ContentRecord }>(
        await fetch('/api/admin/content/' + record.key, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft, revision: record.revision, action }),
        }),
      );
      setRecord(d.record);
      setDraft(d.record.draft);
      setDirty(false);
      setMessage(
        action === 'publish'
          ? 'Published. Your website now shows these changes.'
          : action === 'discard'
            ? 'Draft reset to the current live version.'
            : 'Draft saved. Open preview to review before publishing.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
      setConfirmation(null);
    }
  }

  async function upload(file: File, done: (url: string) => void) {
    setBusy(true);
    setError('');
    setMessage('Uploading ' + file.name + '…');
    try {
      const a = await uploadAsset(file);
      setAssets((old) => [a, ...old]);
      done(a.url);
      setDirty(true);
      setMessage('Uploaded privately. Save and publish this page to use the file on the website.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DeskHeader owner />
      <main id="main" className="container desk-main">
        <a className="text-link" href="/admin/content">
          All website content
        </a>
        <div className="editor-toolbar cms-toolbar">
          <div>
            <p className="eyebrow">Website content</p>
            <h1>{definition.title}</h1>
          </div>
          <div>
            <button
              type="button"
              className="desk-secondary"
              disabled={busy}
              onClick={() => save()}
            >
              <Save size={16} />
              {busy ? 'Working…' : 'Save draft'}
            </button>
            <a
              className="desk-secondary"
              href={'/admin/preview/' + record.key}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye size={16} />
              Preview saved draft
            </a>
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => setConfirmation('publish')}
            >
              Publish changes
            </button>
          </div>
        </div>
        <p className="cms-description">{definition.description}</p>
        <p className="small">
          {dirty
            ? 'Unsaved changes'
            : record.revision === record.publishedRevision
              ? 'Current version is published'
              : 'Draft changes are private'}{' '}
          · Save before previewing. Publishing updates this section only.
        </p>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="notice error-notice" role="alert">
            {error}
          </p>
        )}
        <fieldset className="cms-fields" disabled={busy}>
          <EditorFields
            fields={definition.fields}
            data={draft}
            onChange={(d) => {
              setDraft(d);
              setDirty(true);
              setMessage('');
            }}
            assets={assets}
            onUpload={upload}
          />
        </fieldset>
        <div className="cms-bottom">
          <button
            type="button"
            className="desk-secondary"
            disabled={busy}
            onClick={() => save()}
          >
            Save draft
          </button>
          <button
            type="button"
            className="text-link"
            disabled={busy}
            onClick={() => setConfirmation('discard')}
          >
            Discard draft changes
          </button>
          <a
            href={definition.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            View live page
          </a>
        </div>
        <AlertDialog
          open={!!confirmation}
          onOpenChange={(open) => {
            if (!open && !busy) setConfirmation(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmation === 'publish'
                  ? 'Publish this section?'
                  : 'Discard draft changes?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmation === 'publish'
                  ? 'Your saved and current changes to ' +
                    definition.title +
                    ' will become visible to website visitors.'
                  : 'This restores the current published content. Unpublished edits in this section will be lost.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={busy}
                onClick={() => save(confirmation || 'save')}
              >
                {confirmation === 'publish' ? 'Publish now' : 'Discard changes'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}

export function FileLibrary({ initial }: { initial: AssetOption[] }) {
  const [assets, setAssets] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [archived, setArchived] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError('');
    setMessage('Uploading ' + file.name + '…');
    try {
      const a = await uploadAsset(file);
      setAssets((old) => [a, ...old]);
      setMessage(
        'Uploaded. Select this file in Team profiles, Website content or Document library, then publish that section.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  async function action(id: string, actionType: string) {
    setBusy(true);
    setError('');
    try {
      const d = await jsonResponse<{ assets: AssetOption[] }>(
        await fetch('/api/admin/assets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: actionType }),
        }),
      );
      setAssets(d.assets);
      setMessage(
        actionType === 'archive'
          ? 'File archived. You can restore it from Archived files.'
          : 'File restored.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update file.');
    } finally {
      setBusy(false);
    }
  }

  const rows = assets.filter(
    (a) =>
      !!a.archived === archived &&
      a.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <DeskHeader owner />
      <main id="main" className="container desk-main">
        <div className="desk-heading">
          <div>
            <p className="eyebrow">Media & documents</p>
            <h1>Files</h1>
            <p>
              Upload logos, team photos and standalone documents. Research
              attachments are managed within each article.
            </p>
          </div>
        </div>
        <section className="cms-upload-panel">
          <label htmlFor="library-upload">
            <Upload size={20} />
            Upload a file
          </label>
          <input
            id="library-upload"
            type="file"
            disabled={busy}
            accept=".pdf,.xlsx,.csv,.docx,.pptx,.png,.jpg,.jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = '';
            }}
          />
          <p className="small">
            PNG and JPEG photos; PDF, Excel, CSV, Word and PowerPoint documents. Up to
            10 MB each. Files stay private until used by published content.
          </p>
        </section>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="notice error-notice" role="alert">
            {error}
          </p>
        )}
        <div className="desk-filters">
          <div className="form-field">
            <label htmlFor="file-search">Find files</label>
            <input
              id="file-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="cms-toggle">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Archived files
          </label>
        </div>
        <div className="cms-assets">
          {rows.map((a) => (
            <article className="cms-asset" key={a.id}>
              {a.mime.startsWith('image/') ? (
                <img src={a.url} alt={a.name} />
              ) : (
                <FileText size={36} />
              )}
              <h2>{a.name}</h2>
              <p className="small">
                {(a.size / 1024).toFixed(0)} KB ·{' '}
                {new Date(a.created_at).toLocaleDateString()}
              </p>
              <p className="small">
                {a.usedBy.length
                  ? 'Used in: ' + a.usedBy.join(', ')
                  : 'Not currently used on a page'}
              </p>
              <div className="cms-bottom">
                <a
                  className="text-link"
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open file
                </a>
                <button
                  type="button"
                  className="text-link"
                  disabled={busy}
                  onClick={() => action(a.id, a.archived ? 'restore' : 'archive')}
                >
                  {a.archived ? 'Restore' : 'Archive'}
                </button>
              </div>
            </article>
          ))}
        </div>
        {!rows.length && <p className="desk-empty">No matching files.</p>}
        <p className="notice">
          To replace a document, open{' '}
          <a href="/admin/content/resources">Document library</a> or the relevant
          research article, upload the newer file, and publish the change. Then archive
          the unused older file here.
        </p>
      </main>
    </>
  );
}

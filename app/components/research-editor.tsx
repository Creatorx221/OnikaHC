/* eslint-disable typescript/no-deprecated -- beforeunload returnValue is required by older browsers. */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Save,
  Eye,
  Upload,
  ArrowLeft,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import {
  emptyDraft,
  researchTypes,
  type EditorialPost,
  type ResearchDraft,
  type Material,
} from '@/lib/cms-types';
import { publicationIssues } from '@/lib/cms-validation';
import { DeskHeader } from './research-desk';
import { Choice } from './library';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type Action = 'publish' | 'unpublish' | 'archive' | 'restore' | 'leave';
export function ResearchEditor({
  initial,
  author,
}: {
  initial: EditorialPost | null;
  author: string;
}) {
  const router = useRouter(),
    [post, setPost] = useState(initial),
    [draft, setDraft] = useState<ResearchDraft>(
      initial?.draft || { ...emptyDraft(), author },
    ),
    [dirty, setDirty] = useState(false),
    [preview, setPreview] = useState(false),
    [pending, setPending] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [confirm, setConfirm] = useState<Action | null>(null),
    [customSlug, setCustomSlug] = useState(!!initial);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        /* Older browsers still require returnValue for the leave-page prompt. */ e.returnValue =
          '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const issues = publicationIssues(draft),
    archived = post?.status === 'archived';
  function change<K extends keyof ResearchDraft>(
    key: K,
    value: ResearchDraft[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setNotice('');
  }
  function titleChange(value: string) {
    setDraft((d) => ({
      ...d,
      title: value,
      ...(!post && !customSlug
        ? {
            slug: value
              .toLowerCase()
              .normalize('NFKD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 100),
          }
        : {}),
    }));
    setDirty(true);
  }
  async function save(action = 'save') {
    setPending(true);
    setError('');
    setNotice('');
    try {
      let current = post;
      if (!current) {
        const r = await fetch('/api/admin/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft }),
        });
        const data = (await r.json()) as {
          error?: string;
          post: EditorialPost;
          material: Material;
        };
        if (!r.ok) throw Error(data.error);
        current = data.post as EditorialPost;
        setPost(current);
        setDraft(current.draft);
        router.replace('/admin/research/' + current.id);
        if (action === 'save') {
          setDirty(false);
          setNotice('Draft saved. You can now attach supporting materials.');
          return;
        }
      }
      const r = await fetch('/api/admin/research/' + current!.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, revision: current!.revision, action }),
      });
      const data = (await r.json()) as {
        error?: string;
        post: EditorialPost;
        material: Material;
      };
      if (!r.ok) throw Error(data.error);
      setPost(data.post);
      setDraft(data.post.draft);
      setDirty(false);
      setNotice(
        action === 'publish'
          ? 'Published. The research library now shows this version.'
          : action === 'unpublish'
            ? 'Unpublished. The article and its files are now private.'
            : action === 'archive'
              ? 'Archived. You can restore this draft later.'
              : action === 'restore'
                ? 'Draft restored.'
                : 'Draft saved. The live version is unchanged.',
      );
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to save. Keep this page open and try again.',
      );
    } finally {
      setPending(false);
      setConfirm(null);
    }
  }
  async function upload(file: File) {
    if (!post) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Choose a file up to 10 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const r = await fetch('/api/admin/research/' + post.id + '/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(file.name),
        },
        body: file,
      });
      const data = (await r.json()) as {
        error?: string;
        post: EditorialPost;
        material: Material;
      };
      if (!r.ok) throw Error(data.error);
      const material = data.material as Material;
      setPost((p) => (p ? { ...p, materials: [material, ...p.materials] } : p));
      change('materialIds', [...draft.materialIds, material.id]);
      setNotice(
        'File uploaded privately. Save the draft to keep its attachment selection.',
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to upload. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  }
  const confirmations: Record<Action, [string, string]> = {
    publish: [
      'Publish this research?',
      draft.title +
        ' will be visible in the public research library, along with its selected attachments.',
    ],
    unpublish: [
      'Take this research offline?',
      'The article and its attachments will become private. Your draft will remain available.',
    ],
    archive: [
      'Archive this research?',
      'The article will be taken offline and kept in your archive. You can restore it later.',
    ],
    restore: [
      'Restore this draft?',
      'The article will return to Drafts. It will stay private until you publish it.',
    ],
    leave: [
      'Leave without saving?',
      'Your unsaved changes on this page will be lost. Previously saved research will stay available.',
    ],
  };
  return (
    <>
      <DeskHeader />
      <main id="main" className="container desk-main">
        <div className="editor-top">
          <button
            className="text-link"
            onClick={() =>
              dirty ? setConfirm('leave') : router.push('/admin')
            }
          >
            <ArrowLeft size={16} />
            All research
          </button>
          <span className={'desk-status ' + (post?.status || 'draft')}>
            {post?.status || 'New draft'}
            {dirty
              ? ' · Unsaved changes'
              : post &&
                  post.status === 'published' &&
                  post.revision !== post.publishedRevision
                ? ' · Changes awaiting publication'
                : ''}
          </span>
        </div>
        <div className="editor-toolbar">
          <h1>{post ? 'Edit research' : 'New research'}</h1>
          <div>
            <button
              className="desk-secondary"
              onClick={() => setPreview(!preview)}
            >
              <Eye size={16} />
              {preview ? 'Return to editor' : 'Preview draft'}
            </button>
            {!archived && (
              <>
                <button
                  className="desk-secondary"
                  disabled={pending || uploading}
                  onClick={() => save()}
                >
                  <Save size={16} />
                  {pending ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  className="button"
                  disabled={
                    pending || uploading || issues.length > 0 || !draft.title
                  }
                  onClick={() => setConfirm('publish')}
                >
                  Publish <ArrowUpRight size={16} />
                </button>
              </>
            )}
            {archived && (
              <button className="button" onClick={() => setConfirm('restore')}>
                Restore draft
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="notice desk-error" role="alert">
            {error}
          </p>
        )}
        {notice && <output className="notice block">{notice}</output>}
        {preview ? (
          <div className="desk-preview">
            <p className="eyebrow">Draft preview · Not the live version</p>
            <span className="eyebrow">{draft.type}</span>
            <h2>{draft.title || 'Your research title'}</h2>
            <p className="lead">
              {draft.summary || 'Your summary will appear here.'}
            </p>
            <p className="small">
              {draft.author} · {draft.date}
            </p>
            <section className="takeaways">
              <h3>Key takeaways</h3>
              <ol>
                {draft.takeaways.map((t, i) => (
                  <li key={i}>{t || 'Takeaway ' + (i + 1)}</li>
                ))}
              </ol>
            </section>
            {draft.sections.map((s, i) => (
              <section className="draft-section" key={i}>
                <h3>{s.title || 'Section heading'}</h3>
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
            <section className="draft-section">
              <h3>Sources and disclosures</h3>
              <ul>
                {draft.sources.map((s, i) => (
                  <li key={i}>
                    {s.label} {s.url && <span>— {s.url}</span>}
                  </li>
                ))}
              </ul>
              <p>{draft.disclosures}</p>
            </section>
            <section className="draft-section">
              <h3>Supporting materials</h3>
              {post?.materials
                .filter((m) => draft.materialIds.includes(m.id))
                .map((m) => (
                  <p key={m.id}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      {m.name}
                    </a>
                  </p>
                ))}
            </section>
          </div>
        ) : (
          <div className="editor-layout">
            <form
              className="editor-fields"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <fieldset disabled={archived || pending}>
                <section className="editor-block">
                  <p className="eyebrow">01 · The essentials</p>
                  <div className="form-field">
                    <label htmlFor="research-title">Title</label>
                    <input
                      id="research-title"
                      value={draft.title}
                      onChange={(e) => titleChange(e.target.value)}
                      maxLength={200}
                      placeholder="What does this research help readers understand?"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="research-summary">Short summary</label>
                    <textarea
                      id="research-summary"
                      value={draft.summary}
                      onChange={(e) => change('summary', e.target.value)}
                      maxLength={1000}
                      rows={3}
                    />
                  </div>
                  <div className="form-grid">
                    <Choice
                      id="research-type"
                      label="Category"
                      value={draft.type}
                      onChange={(value) => change('type', value)}
                      options={researchTypes.map((t) => ({
                        value: t,
                        label: t,
                      }))}
                    />
                    <div className="form-field">
                      <label htmlFor="research-author">Author</label>
                      <input
                        id="research-author"
                        value={draft.author}
                        onChange={(e) => change('author', e.target.value)}
                        maxLength={180}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="research-date">Publication date</label>
                      <input
                        id="research-date"
                        type="date"
                        value={draft.date}
                        onChange={(e) => change('date', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="research-topics">
                        Topics, separated by commas
                      </label>
                      <input
                        id="research-topics"
                        value={draft.topics.join(', ')}
                        onChange={(e) =>
                          change(
                            'topics',
                            e.target.value.split(',').map((t) => t.trim()),
                          )
                        }
                        placeholder="Inflation, Interest rates"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="research-slug">Web address</label>
                    <div className="slug-field">
                      <span>/research/</span>
                      <input
                        id="research-slug"
                        value={draft.slug}
                        readOnly={!!post}
                        onChange={(e) => {
                          setCustomSlug(true);
                          change('slug', e.target.value);
                        }}
                        maxLength={100}
                      />
                    </div>
                    <p className="small">
                      This address stays fixed after your first save so links
                      keep working.
                    </p>
                  </div>
                  <label className="desk-check" htmlFor="research-featured">
                    <Checkbox
                      id="research-featured"
                      checked={draft.featured}
                      onCheckedChange={(v) => change('featured', !!v)}
                    />
                    Feature this article on the home page
                  </label>
                </section>
                <section className="editor-block">
                  <p className="eyebrow">02 · Three key takeaways</p>
                  {[0, 1, 2].map((i) => (
                    <div className="form-field" key={i}>
                      <label htmlFor={'takeaway-' + i}>Takeaway {i + 1}</label>
                      <textarea
                        id={'takeaway-' + i}
                        value={draft.takeaways[i] || ''}
                        onChange={(e) =>
                          change(
                            'takeaways',
                            [0, 1, 2].map((j) =>
                              j === i
                                ? e.target.value
                                : draft.takeaways[j] || '',
                            ),
                          )
                        }
                        maxLength={600}
                        rows={2}
                      />
                    </div>
                  ))}
                </section>
                <section className="editor-block">
                  <p className="eyebrow">03 · Your analysis</p>
                  {draft.sections.map((s, i) => (
                    <div className="section-editor" key={i}>
                      <div className="section-editor-top">
                        <strong>Section {i + 1}</strong>
                        <button
                          type="button"
                          className="plain-button"
                          aria-label={'Remove section ' + (i + 1)}
                          onClick={() =>
                            change(
                              'sections',
                              draft.sections.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-field">
                        <label htmlFor={'section-title-' + i}>
                          Section heading
                        </label>
                        <input
                          id={'section-title-' + i}
                          value={s.title}
                          maxLength={180}
                          onChange={(e) =>
                            change(
                              'sections',
                              draft.sections.map((x, j) =>
                                j === i ? { ...x, title: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor={'section-body-' + i}>
                          Section text
                        </label>
                        <textarea
                          id={'section-body-' + i}
                          value={s.paragraphs.join('\n\n')}
                          rows={8}
                          onChange={(e) =>
                            change(
                              'sections',
                              draft.sections.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      paragraphs:
                                        e.target.value.split(/\n\s*\n/),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <p className="small">
                          Separate paragraphs with a blank line. Your text is
                          displayed as written.
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="desk-secondary"
                    disabled={draft.sections.length >= 30}
                    onClick={() =>
                      change('sections', [
                        ...draft.sections,
                        {
                          id: 'section-' + (draft.sections.length + 1),
                          title: '',
                          paragraphs: [],
                        },
                      ])
                    }
                  >
                    <Plus size={16} />
                    Add section
                  </button>
                </section>
                <section className="editor-block">
                  <p className="eyebrow">04 · Sources and disclosures</p>
                  {draft.sources.map((s, i) => (
                    <div className="source-editor" key={i}>
                      <div className="form-field">
                        <label htmlFor={'source-name-' + i}>
                          Source {i + 1}: name
                        </label>
                        <input
                          id={'source-name-' + i}
                          value={s.label}
                          maxLength={300}
                          onChange={(e) =>
                            change(
                              'sources',
                              draft.sources.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor={'source-url-' + i}>
                          Source {i + 1}: link (optional)
                        </label>
                        <input
                          id={'source-url-' + i}
                          value={s.url || ''}
                          maxLength={2000}
                          placeholder="https://"
                          onChange={(e) =>
                            change(
                              'sources',
                              draft.sources.map((x, j) =>
                                j === i ? { ...x, url: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="plain-button"
                        onClick={() =>
                          change(
                            'sources',
                            draft.sources.filter((_, j) => j !== i),
                          )
                        }
                      >
                        Remove source
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="desk-secondary"
                    disabled={draft.sources.length >= 40}
                    onClick={() =>
                      change('sources', [
                        ...draft.sources,
                        { label: '', url: '' },
                      ])
                    }
                  >
                    <Plus size={16} />
                    Add source
                  </button>
                  <div className="form-field disclosure-field">
                    <label htmlFor="research-disclosures">
                      Disclosures and limitations
                    </label>
                    <textarea
                      id="research-disclosures"
                      value={draft.disclosures}
                      onChange={(e) => change('disclosures', e.target.value)}
                      maxLength={6000}
                      rows={5}
                      placeholder="Explain the scope, assumptions, limitations, authorship, sponsorship and any relevant conflicts."
                    />
                  </div>
                </section>
              </fieldset>
            </form>
            <aside className="editor-aside">
              <section className="editor-side-block">
                <p className="eyebrow">Ready to publish</p>
                {issues.length ? (
                  <>
                    <p>Save your progress at any time. Before publishing:</p>
                    <ul>
                      {issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    Required fields are complete. Review the draft and its
                    attachments before publishing.
                  </p>
                )}
                {post?.status === 'published' && (
                  <a
                    className="text-link"
                    href={'/research/' + post.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View live article <ArrowUpRight size={16} />
                  </a>
                )}
              </section>
              <section className="editor-side-block">
                <p className="eyebrow">Supporting materials</p>
                <p>
                  PDFs, spreadsheets, documents and images. Up to 10 MB per
                  file.
                </p>
                {!post ? (
                  <p className="notice">Save the draft to enable uploads.</p>
                ) : (
                  <>
                    <label className="upload-label">
                      <Upload size={17} />
                      {uploading ? 'Uploading…' : 'Upload a file'}
                      <input
                        type="file"
                        aria-label="Upload supporting material"
                        accept=".pdf,.xlsx,.csv,.docx,.pptx,.png,.jpg,.jpeg"
                        disabled={
                          uploading ||
                          pending ||
                          archived ||
                          draft.materialIds.length >= 20
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void upload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <p className="small">
                      Select the files to include when this article is
                      published.
                    </p>
                    {post.materials.map((m) => (
                      <div className="material-item" key={m.id}>
                        <label className="desk-check">
                          <Checkbox
                            disabled={archived || pending}
                            checked={draft.materialIds.includes(m.id)}
                            onCheckedChange={(checked) => {
                              if (checked && draft.materialIds.length >= 20) {
                                setError('Select up to 20 attachments.');
                                return;
                              }
                              change(
                                'materialIds',
                                checked
                                  ? [...draft.materialIds, m.id]
                                  : draft.materialIds.filter(
                                      (id) => id !== m.id,
                                    ),
                              );
                            }}
                          />
                          <span>
                            {m.name}
                            <small>{(m.size / 1024).toFixed(0)} KB</small>
                          </span>
                        </label>
                        <a
                          className="small"
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open file
                        </a>
                      </div>
                    ))}
                  </>
                )}
              </section>
              {post && !archived && (
                <section className="editor-side-block">
                  <p className="eyebrow">Article controls</p>
                  {post.status === 'published' && (
                    <button
                      className="text-link"
                      disabled={pending}
                      onClick={() => setConfirm('unpublish')}
                    >
                      Unpublish article
                    </button>
                  )}
                  <button
                    className="text-link"
                    disabled={pending}
                    onClick={() => setConfirm('archive')}
                  >
                    Archive article
                  </button>
                  <p className="small">
                    Archived research can be restored. Files become private when
                    an article is taken offline.
                  </p>
                </section>
              )}
            </aside>
          </div>
        )}
        <AlertDialog
          open={!!confirm}
          onOpenChange={(open) => {
            if (!open && !pending) setConfirm(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirm && confirmations[confirm][0]}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirm && confirmations[confirm][1]}
                {dirty && ['archive', 'unpublish'].includes(confirm || '')
                  ? ' Unsaved changes will be discarded.'
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={() => {
                  if (confirm === 'leave') {
                    setDirty(false);
                    router.push('/admin');
                  } else if (confirm) void save(confirm);
                }}
              >
                {pending
                  ? 'Saving…'
                  : confirm === 'publish'
                    ? 'Publish now'
                    : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}

/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Keep the approved logo asset and full navigation for unsaved-work protection and Sites sign-out. */
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowUpRight, FileText, Users } from 'lucide-react';
import type { EditorialPost, EditorRequest } from '@/lib/cms-types';
import { Choice } from './library';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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

export function DeskHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="desk-header">
      <a href="/admin" aria-label="Research desk home">
        <img
          src="/logo-modern.png"
          width="2172"
          height="724"
          alt="Heuresis Capital"
        />
      </a>
      <nav aria-label="Research desk navigation">
        {children}
        <a href="/research" target="_blank" rel="noopener noreferrer">
          View website <ArrowUpRight size={15} />
        </a>
        <a href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">
          Sign out
        </a>
      </nav>
    </header>
  );
}
const statusLabel = (p: EditorialPost) =>
  p.status === 'published' && p.revision !== p.publishedRevision
    ? 'Published · Changes saved'
    : p.status === 'published'
      ? 'Published'
      : p.status === 'archived'
        ? 'Archived'
        : 'Draft';
export function DeskDashboard({
  posts,
  name,
  owner,
}: {
  posts: EditorialPost[];
  name: string;
  owner: boolean;
}) {
  const [q, setQ] = useState(''),
    [status, setStatus] = useState('');
  const filtered = posts.filter(
    (p) =>
      (!status || p.status === status) &&
      [p.draft.title, p.draft.author, p.draft.type]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <DeskHeader>
        {owner && (
          <Link href="/admin/team">
            <Users size={16} />
            Team access
          </Link>
        )}
      </DeskHeader>
      <main id="main" className="container desk-main">
        <div className="desk-heading">
          <div>
            <p className="eyebrow">Publishing workspace</p>
            <h1>Research desk</h1>
            <p>Welcome, {name}. Pick up a draft or begin your next piece.</p>
          </div>
          <Link className="button" href="/admin/research/new">
            <Plus size={18} />
            New research
          </Link>
        </div>
        <div className="desk-counts">
          <span>
            <strong>{posts.filter((p) => p.status === 'draft').length}</strong>{' '}
            drafts
          </span>
          <span>
            <strong>
              {posts.filter((p) => p.status === 'published').length}
            </strong>{' '}
            published
          </span>
          <span>
            <strong>
              {posts.filter((p) => p.status === 'archived').length}
            </strong>{' '}
            archived
          </span>
        </div>
        <div className="desk-filters">
          <div className="form-field">
            <label htmlFor="desk-search">Find research</label>
            <input
              id="desk-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author or category"
            />
          </div>
          <Choice
            id="desk-status"
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'All research' },
              { value: 'draft', label: 'Drafts' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
        {filtered.length ? (
          <Table className="desk-table">
            <TableHeader>
              <TableRow>
                <TableHead>Research</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last saved</TableHead>
                <TableHead>
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      className="desk-title-link"
                      href={'/admin/research/' + p.id}
                    >
                      {p.draft.title}
                    </Link>
                    <p className="small">
                      {p.draft.type} · {p.draft.author || 'Author to add'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={'desk-status ' + p.status}>
                      {statusLabel(p)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(p.updatedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Link
                      className="text-link"
                      href={'/admin/research/' + p.id}
                    >
                      Open <ArrowUpRight size={16} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="desk-empty">
            <FileText size={32} />
            <h2>
              {posts.length
                ? 'No matching research.'
                : 'Your first publication starts here.'}
            </h2>
            <p>
              {posts.length
                ? 'Try another search or status.'
                : 'Create a draft, add your analysis and supporting files, then review it before publishing.'}
            </p>
            {!posts.length && (
              <Link className="button" href="/admin/research/new">
                Create your first draft <Plus size={16} />
              </Link>
            )}
          </div>
        )}
        <p className="small desk-footnote">
          Drafts and their files are private. Publishing adds the article to the
          public library immediately.
        </p>
      </main>
    </>
  );
}
export function AccessRequest({ requested }: { requested: boolean }) {
  const [sent, setSent] = useState(requested),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  async function request() {
    setPending(true);
    setError('');
    try {
      const r = await fetch('/api/admin/team', { method: 'POST' });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(data.error);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to request access.');
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button className="button" disabled={sent || pending} onClick={request}>
        {sent
          ? 'Access request received'
          : pending
            ? 'Requesting…'
            : 'Request publishing access'}
      </button>
      {sent && (
        <output className="block">
          The site owner can now review your request in Team access.
        </output>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function TeamAccess({ entries }: { entries: EditorRequest[] }) {
  const router = useRouter(),
    [rows, setRows] = useState(entries),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [choice, setChoice] = useState<{
      row: EditorRequest;
      status: string;
    } | null>(null);
  async function update() {
    if (!choice) return;
    setPending(true);
    setError('');
    try {
      const r = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: choice.row.userId,
          status: choice.status,
        }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(data.error);
      setRows(
        rows.map((row) =>
          row.userId === choice.row.userId
            ? { ...row, status: choice.status }
            : row,
        ),
      );
      setChoice(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update access.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <DeskHeader>
        <Link href="/admin">Research desk</Link>
      </DeskHeader>
      <main id="main" className="container desk-main">
        <div className="desk-heading">
          <div>
            <p className="eyebrow">Owner controls</p>
            <h1>Team access</h1>
            <p>
              Teammates sign in at /admin and request access. Approve only the
              people who should edit and publish research.
            </p>
          </div>
        </div>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {rows.length ? (
          <Table className="desk-table">
            <TableHeader>
              <TableRow>
                <TableHead>Team member</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell>
                    <strong>{row.name}</strong>
                    <p className="small">{row.email}</p>
                  </TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <button
                      className="text-link"
                      onClick={() =>
                        setChoice({
                          row,
                          status:
                            row.status === 'approved' ? 'revoked' : 'approved',
                        })
                      }
                    >
                      {row.status === 'approved'
                        ? 'Revoke access'
                        : 'Approve editor'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="desk-empty">
            <Users size={30} />
            <h2>No access requests yet.</h2>
            <p>
              Share the research desk address with your team. Your owner account
              already has publishing access.
            </p>
          </div>
        )}
        <AlertDialog
          open={!!choice}
          onOpenChange={(open) => {
            if (!open && !pending) setChoice(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {choice?.status === 'approved'
                  ? 'Approve publishing access?'
                  : 'Revoke publishing access?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {choice?.row.email}{' '}
                {choice?.status === 'approved'
                  ? 'will be able to edit, upload and publish research.'
                  : 'will no longer be able to use the research desk.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={pending} onClick={update}>
                {pending ? 'Saving…' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}

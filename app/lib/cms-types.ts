export type ResearchDraft = {
  title: string;
  slug: string;
  summary: string;
  type: string;
  topics: string[];
  author: string;
  date: string;
  takeaways: string[];
  sections: { id: string; title: string; paragraphs: string[] }[];
  sources: { label: string; url?: string }[];
  disclosures: string;
  materialIds: string[];
  featured: boolean;
};
export type Material = {
  id: string;
  postId: string;
  name: string;
  mime: string;
  size: number;
  createdAt: string;
  url: string;
};
export type EditorialPost = {
  id: string;
  slug: string;
  draft: ResearchDraft;
  status: 'draft' | 'published' | 'archived';
  revision: number;
  publishedRevision: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  materials: Material[];
};
export type EditorRequest = {
  userId: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
};
export const researchTypes = [
  'Equities',
  'Macro & Strategy',
  'Fixed Income',
  'Sectors & Themes',
  'Bespoke',
];
export function emptyDraft(): ResearchDraft {
  return {
    title: '',
    slug: '',
    summary: '',
    type: 'Macro & Strategy',
    topics: [],
    author: '',
    date: new Date().toISOString().slice(0, 10),
    takeaways: ['', '', ''],
    sections: [{ id: 'section-1', title: '', paragraphs: [] }],
    sources: [{ label: '', url: '' }],
    disclosures: '',
    materialIds: [],
    featured: false,
  };
}

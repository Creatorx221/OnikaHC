import { site } from './site-config';
import { samples } from '@/content/samples';
import { readMarkdownResearch } from './markdown-research';
import { publicResearch } from './cms-store';
import type { Research } from './research';

export async function getResearch(): Promise<Research[]> {
  const published = await publicResearch();
  const slugs = new Set(published.map((r) => r.slug));
  const items = [
    ...published,
    ...readMarkdownResearch().filter(
      (r) => r.status === 'published' && !slugs.has(r.slug),
    ),
  ];
  if (site.preview) items.push(...samples.filter((r) => !slugs.has(r.slug)));
  return items.sort(
    (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      (b.date || '').localeCompare(a.date || '') ||
      (a.sampleOrder || 0) - (b.sampleOrder || 0),
  );
}
export async function findResearch(slug: string) {
  return (await getResearch()).find((r) => r.slug === slug);
}

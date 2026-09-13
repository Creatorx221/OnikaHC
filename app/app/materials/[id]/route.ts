import { getBucket } from '@/db';
import { fileRecord, fileIsPublic } from '@/lib/cms-store';
import { editorSession } from '@/lib/cms-auth';
export const dynamic = 'force-dynamic';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id,
      file = await fileRecord(id);
    if (!file)
      return new Response('File not found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    const visible = await fileIsPublic(id);
    if (!visible && !(await editorSession())?.editor)
      return new Response('File not found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    const object = await getBucket().get(file.object_key);
    if (!object)
      return new Response('File not found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    return new Response(object.body, {
      headers: {
        'Content-Type': file.mime,
        'Content-Length': String(file.size),
        'Content-Disposition':
          "attachment; filename*=UTF-8''" + encodeURIComponent(file.name),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('Material retrieval failed', error);
    return new Response(
      'The file is temporarily unavailable. Please try again.',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

import { env } from 'cloudflare:workers';
export function getDb() {
  if (!env.DB) throw new Error('Research database unavailable');
  return env.DB;
}
export function getBucket() {
  if (!env.BUCKET) throw new Error('Research file storage unavailable');
  return env.BUCKET;
}

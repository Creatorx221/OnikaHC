import { getChatGPTUser } from '@/app/chatgpt-auth';
import { cmsResponse } from '@/lib/cms-auth';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await getChatGPTUser();
  return cmsResponse(
    user
      ? { userId: user.userId, email: user.email }
      : { error: 'Sign in required' },
    user ? 200 : 401,
  );
}

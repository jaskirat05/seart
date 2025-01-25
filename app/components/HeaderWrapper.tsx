import { cookies } from 'next/headers';
import Header from './Header';
import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * HeaderWrapper component that wraps the Header component
 * and passes the sessionId and userId as props
 */
async function HeaderWrapper() {
  const cookieStore = await cookies();
  const userId = await auth();
  const sessionId = cookieStore.get('anon_session_id')?.value;
  
  console.log('Session ID:Header Wrapper', sessionId);
  console.log('User ID:Header Wrapper', userId?.userId??null);
  return <Header sessionId={!userId?.userId ? sessionId : null} userId={userId?.userId ?? null}/>;
}

export default HeaderWrapper;

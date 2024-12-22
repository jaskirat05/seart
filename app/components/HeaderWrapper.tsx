import { cookies } from 'next/headers';
import Header from './Header';
import { auth, currentUser } from '@clerk/nextjs/server'


async function HeaderWrapper() {
  const cookieStore =await cookies();
  const userId=await auth();
  const sessionId = cookieStore.get('anon_session_id')?.value;
  
  console.log('Session ID:', sessionId);

  return <Header sessionId={sessionId} userId={userId?userId.userId:null}/>;
}

export default HeaderWrapper;

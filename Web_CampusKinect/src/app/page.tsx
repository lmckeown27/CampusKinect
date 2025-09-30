// Force dynamic rendering to prevent build hanging
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to home page
  redirect('/home');
}

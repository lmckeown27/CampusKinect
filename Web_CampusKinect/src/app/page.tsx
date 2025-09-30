import { redirect } from 'next/navigation';

export default function HomePage() {
  // Immediately redirect to login page
  redirect('/auth/login');
}

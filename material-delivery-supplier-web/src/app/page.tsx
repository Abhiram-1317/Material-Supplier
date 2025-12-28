import {redirect} from 'next/navigation';

const BYPASS_AUTH = process.env.NEXT_PUBLIC_SUPPLIER_AUTH_BYPASS === 'true';

export default function Home() {
  redirect(BYPASS_AUTH ? '/dashboard' : '/login');
}

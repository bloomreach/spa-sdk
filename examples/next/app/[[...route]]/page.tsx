import { headers } from 'next/headers';
import BrxApp from '../../components/BrxApp';

export default async function Page() {
  const headersList = headers();
  const origin = headersList.get('x-next-origin');
  const searchParams = headersList.get('x-next-search-params');
  const nextPathname = headersList.get('x-next-pathname');
  const pathname = nextPathname === '/' ? '' : nextPathname;

  const res = await fetch(`${origin}/api${pathname}?${searchParams}`, { cache: 'no-store' });
  const { page, configuration } = await res.json();

  return (
    <BrxApp configuration={configuration} page={page} />
  )
}

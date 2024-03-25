import { headers } from 'next/headers';
import BrxApp from '../../components/BrxApp';
import {fetchBrxData} from '../../utils/fetchBrxData';

export default async function Page() {
  const headersList = headers();
  const origin = headersList.get('x-next-origin');
  const searchParams = headersList.get('x-next-search-params');
  const nextPathname = headersList.get('x-next-pathname');
  const pathname = nextPathname === '/' ? '' : nextPathname;
  const path = `${pathname}?${searchParams}`;
  const url = `${origin}/api${path}`;

  const { page, configuration } = await fetchBrxData(url);

  return (
    <BrxApp configuration={configuration} page={page} url={url}/>
  )
}

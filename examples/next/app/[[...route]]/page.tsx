/*
 * Copyright 2024 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { headers } from 'next/headers';
import BrxApp from '../../components/BrxApp';
import {fetchBrxData} from '../../utils/fetchBrxData';

export default async function Page() {
  const headersList = headers();
  const origin = headersList.get('x-next-origin');
  const searchParams = headersList.get('x-next-search-params');
  const nextPathname = headersList.get('x-next-pathname');
  const pathname = nextPathname === '/' ? '' : nextPathname;
  const url = `${origin}/api${pathname}?${searchParams}`;

  const { page, configuration } = await fetchBrxData(url);

  return (
    <BrxApp configuration={configuration} page={page} url={url}/>
  )
}

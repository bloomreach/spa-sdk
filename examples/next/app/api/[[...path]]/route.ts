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

import {buildConfiguration} from '../../../utils/buildConfiguration';
import {initialize} from '@bloomreach/spa-sdk';
import axios from 'axios';
import {NextResponse} from 'next/server';
import {NextApiRequest} from 'next';

export async function GET(request: NextApiRequest, context: { params: Record<string, string[]> }) {
  const {searchParams} = new URL(request.url as string);
  const path = `/${context.params?.path?.join('/') ?? ''}?${searchParams.toString()}`;

  const configuration = buildConfiguration(path, request);
  const page = await initialize({
    ...configuration,
    httpClient: axios
  });

  return NextResponse.json({ page: page.toJSON(), configuration });
}

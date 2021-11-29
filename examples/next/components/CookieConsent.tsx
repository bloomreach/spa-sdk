/*
 * Copyright 2021 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect } from 'react';
import CookieConsentInit, { isConsentReceived, runPersonalization } from '../utils/cookieconsent';

interface CookieConsentProps {
  isPreview: boolean;
  path: string;
}

const isClient = typeof window !== 'undefined';

export const CookieConsent = ({ isPreview, path }: CookieConsentProps): null => {
  useEffect(() => {
    if (isClient && !isPreview) {
      CookieConsentInit();
    }
  }, [isPreview]);

  useEffect(() => {
    if (isClient && !isPreview && isConsentReceived()) {
      runPersonalization(path);
    }
  }, [path, isPreview]);

  return null;
};

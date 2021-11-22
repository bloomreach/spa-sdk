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

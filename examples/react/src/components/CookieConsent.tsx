import { useEffect } from 'react';
import CookieConsentInit, { isConsentReceived, runPersonalization } from '../utils/cookieconsent';

interface CookieConsentProps {
  isPreview: boolean;
  path: string;
}

export const CookieConsent = ({ isPreview, path }: CookieConsentProps): null => {
  useEffect(() => {
    if (!isPreview) {
      CookieConsentInit();
    }
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview && isConsentReceived()) {
      runPersonalization(path);
    }
  }, [path, isPreview]);

  return null;
};

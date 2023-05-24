// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { ReactElement } from 'react';

export const withContextProvider = (context?: Record<string, any>, children?: ReactElement): React.ReactElement => {
  const childContextTypes = (): Record<string, string> | undefined => context
    && Object.keys(context).reduce((obj: Record<string, any>, key: string) => {
      obj[key] = PropTypes.any;
      return obj;
    }, {});

  class ContextProvider extends React.Component {
    getChildContext(): Record<string, string> | undefined {
      return context;
    }

    render(): React.ReactNode {
      return children;
    }
  }

  (ContextProvider as any).displayName = 'ContextProvider';
  (ContextProvider as any).childContextTypes = childContextTypes();

  return React.createElement(ContextProvider, null);
};

declare global {
  interface Window {
    cookieconsent: {
      status: {
        allow: 'allow';
        deny: 'deny';
        dismiss: 'dismiss';
      };
      initialise(config: {
        [key: string]: any;
        onInitialise(status: keyof Window['cookieconsent']['status']): void;
        onStatusChange(status: keyof Window['cookieconsent']['status']): void;
      }): void;
    };
  }
}

export {};

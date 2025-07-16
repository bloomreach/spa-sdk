// Define the type of the environment variables.
declare interface Env {
  readonly NODE_ENV: string;
  // Replace the following with your own environment variables.
  // Example: NGX_VERSION: string;
  [key: string]: any;
  NG_APP_BRXM_ENDPOINT: string;
}

declare interface ImportMeta {
  readonly env: Env;
}

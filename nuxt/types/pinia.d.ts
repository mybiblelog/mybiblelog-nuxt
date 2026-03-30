import 'pinia';

type ApiResponse<T = unknown> = {
  data: T;
  meta?: unknown;
};

type HttpClient = {
  get: <T = unknown>(path: string, options?: unknown) => Promise<ApiResponse<T>>;
  post: <T = unknown>(path: string, body?: unknown) => Promise<ApiResponse<T>>;
  put: <T = unknown>(path: string, body?: unknown) => Promise<ApiResponse<T>>;
  delete: <T = unknown>(path: string) => Promise<ApiResponse<T>>;
};

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $http: HttpClient;
    $vuex: import('vuex').Store<unknown>;
  }
}


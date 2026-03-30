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

type I18nLike = {
  locale: string;
  t: (key: string, params?: Record<string, unknown>) => string;
};

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $http: HttpClient;
    $i18n: I18nLike;
  }
}

